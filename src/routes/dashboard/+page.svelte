<script lang="ts">
	import { resolve } from '$app/paths';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import { formatDateTime, formatRelative, mealTypeClass, mealTypeFromEatenAt } from '$lib/format';
	import EatTimeChart from '$lib/components/EatTimeChart.svelte';
	import MealTypeIcon from '$lib/components/MealTypeIcon.svelte';
	import OverlookedFoodsChart from '$lib/components/OverlookedFoodsChart.svelte';
	import TopFoodsChart from '$lib/components/TopFoodsChart.svelte';

	const client = useConvexClient();
	const pageLoadedAt = Date.now();
	const timezoneOffsetMinutes = new Date().getTimezoneOffset();

	const foods = useQuery(api.foods.withStats, () => ({}));
	const recentLogs = useQuery(api.logs.list, () => ({ limit: 5 }));
	const history = useQuery(api.logs.historySummary, () => ({ now: pageLoadedAt }));
	const eatTimes = useQuery(api.logs.eatTimeDistribution, () => ({ timezoneOffsetMinutes }));

	let showRecommend = $state(false);
	let recommending = $state(false);
	let recommendation = $state<{
		name: string;
		eatCount: number;
		lastEatenAt: number | null;
	} | null>(null);
	let recommendError = $state('');

	const totalLogs = $derived(
		foods.data?.reduce((sum: number, food) => sum + food.eatCount, 0) ?? 0
	);
	const distinctFoods = $derived(foods.data?.length ?? 0);
	const hasEnoughHistory = $derived(history.data?.hasEnoughForRecommend ?? false);
	const daysOfHistory = $derived(Math.floor(history.data?.daysOfHistory ?? 0));
	const daysUntilRecommend = $derived(Math.max(0, 30 - daysOfHistory));
	const topFoods = $derived(
		[...(foods.data ?? [])]
			.sort((a, b) => b.eatCount - a.eatCount || a.name.localeCompare(b.name))
			.slice(0, 5)
			.map((food) => ({ name: food.name, eatCount: food.eatCount }))
	);
	const overlookedFoods = $derived(
		(foods.data ?? [])
			.flatMap((food) => {
				// Skip one-offs: "overlooked" only means neglected among foods you actually repeat.
				if (food.lastEatenAt == null || food.eatCount < 2) return [];
				const daysSince = Math.floor((pageLoadedAt - food.lastEatenAt) / (1000 * 60 * 60 * 24));
				return daysSince >= 3 ? [{ name: food.name, daysSince, eatCount: food.eatCount }] : [];
			})
			.sort((a, b) => b.daysSince - a.daysSince || a.name.localeCompare(b.name))
			.slice(0, 5)
	);

	async function onRecommend() {
		showRecommend = true;
		recommending = true;
		recommendError = '';
		try {
			recommendation = await client.query(api.foods.recommendLeastEaten, {});
		} catch (err) {
			recommendError = err instanceof Error ? err.message : 'Failed to load recommendation';
		} finally {
			recommending = false;
		}
	}
</script>

<svelte:head>
	<title>Dashboard · NextBite</title>
</svelte:head>

<h1 class="mb-6 text-3xl sm:text-4xl">Dashboard</h1>

{#if foods.isLoading || history.isLoading}
	<p class="text-[var(--muted)]">Loading...</p>
{:else if foods.error}
	<p class="text-red-600">Failed to load: {foods.error.toString()}</p>
{:else if history.error}
	<p class="text-red-600">Failed to load history: {history.error.toString()}</p>
{:else}
	<div class="mb-8 grid gap-4 lg:grid-cols-3">
		<div class="grid grid-cols-2 gap-4 lg:grid-cols-1">
			<div class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
				<h2 class="mb-4 text-xl">Total logs</h2>
				<p class="text-3xl font-semibold">{totalLogs}</p>
			</div>
			<div class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
				<h2 class="mb-4 text-xl">Foods tracked</h2>
				<p class="text-3xl font-semibold">{distinctFoods}</p>
			</div>
		</div>

		<section class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
			<h2 class="mb-4 text-xl">Eat time</h2>
			{#if eatTimes.isLoading}
				<p class="text-sm text-[var(--muted)]">Loading...</p>
			{:else if eatTimes.error}
				<p class="text-sm text-red-600">{eatTimes.error.toString()}</p>
			{:else if eatTimes.data}
				<EatTimeChart data={eatTimes.data} />
			{/if}
		</section>
	</div>

	<div class="mb-8 grid gap-4 sm:grid-cols-2">
		<section class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
			<h2 class="mb-4 text-xl">Overlooked foods</h2>
			<OverlookedFoodsChart foods={overlookedFoods} />
		</section>

		<section class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
			<h2 class="mb-4 text-xl">Most eaten foods</h2>
			<TopFoodsChart foods={topFoods} />
		</section>
	</div>

	<div class="mb-8 grid gap-4 lg:grid-cols-2 lg:items-start">
		{#if hasEnoughHistory}
			<section>
				<button
					type="button"
					onclick={onRecommend}
					disabled={recommending}
					class="rounded-lg bg-[var(--accent)] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
				>
					{recommending ? 'Finding a suggestion...' : 'Recommend food'}
				</button>

				{#if showRecommend}
					<div class="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
						{#if recommendError}
							<p class="text-red-600">{recommendError}</p>
						{:else if recommending}
							<p class="text-[var(--muted)]">Finding a suggestion...</p>
						{:else if recommendation}
							<p class="text-sm text-[var(--muted)]">
								Based on your habits, try eating less often:
							</p>
							<p class="mt-1 text-2xl">{recommendation.name}</p>
							<p class="mt-1 text-sm text-[var(--muted)]">
								Logged {recommendation.eatCount}
								{recommendation.eatCount === 1 ? 'time' : 'times'}
								{#if recommendation.lastEatenAt}
									· last {formatRelative(recommendation.lastEatenAt)}
								{:else}
									· never logged yet
								{/if}
							</p>
						{:else}
							<p class="text-[var(--muted)]">Log some meals first to get recommendations.</p>
						{/if}
					</div>
				{/if}
			</section>
		{:else}
			<section class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
				<h2 class="mb-4 text-xl">Food recommendations</h2>
				<p>
					{#if daysOfHistory === 0}
						Log meals for 30 days to unlock recommendations.
					{:else}
						{daysOfHistory} of 30 days logged. {daysUntilRecommend} more to unlock recommendations.
					{/if}
				</p>
			</section>
		{/if}

		<section class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
			<h2 class="mb-4 text-xl">Recent meals</h2>
			{#if recentLogs.isLoading}
				<p class="text-[var(--muted)]">Loading...</p>
			{:else if recentLogs.error}
				<p class="text-red-600">{recentLogs.error.toString()}</p>
			{:else if recentLogs.data && recentLogs.data.length > 0}
				<ul class="divide-y divide-[var(--border)]">
					{#each recentLogs.data as log (log._id)}
						{@const meal = mealTypeFromEatenAt(log.eatenAt)}
						<li
							class="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
						>
							<span class="font-medium">{log.foodName}</span>
							<span class="inline-flex items-center gap-1.5 text-sm {mealTypeClass(meal)}">
								<MealTypeIcon type={meal} />
								{formatDateTime(log.eatenAt)}
							</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-[var(--muted)]">
					No meals logged yet.
					<a href={resolve('/logs')} class="text-[var(--accent)] underline">Add one</a>.
				</p>
			{/if}
		</section>
	</div>
{/if}
