<script lang="ts">
	import { resolve } from '$app/paths';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import { formatDateTime, formatRelative } from '$lib/format';
	import MealsPerDayChart from '$lib/components/MealsPerDayChart.svelte';
	import TopFoodsChart from '$lib/components/TopFoodsChart.svelte';

	const client = useConvexClient();
	const pageLoadedAt = Date.now();
	const timezoneOffsetMinutes = new Date().getTimezoneOffset();

	const foods = useQuery(api.foods.withStats, () => ({}));
	const recentLogs = useQuery(api.logs.list, () => ({ limit: 5 }));
	const history = useQuery(api.logs.historySummary, () => ({ now: pageLoadedAt }));
	const dailyCounts = useQuery(api.logs.dailyCounts, () => ({
		days: 14,
		now: pageLoadedAt,
		timezoneOffsetMinutes
	}));

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
	<div class="mb-8 grid grid-cols-2 gap-4">
		<div class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
			<p class="text-sm text-[var(--muted)]">Total logs</p>
			<p class="text-3xl font-semibold">{totalLogs}</p>
		</div>
		<div class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
			<p class="text-sm text-[var(--muted)]">Foods tracked</p>
			<p class="text-3xl font-semibold">{distinctFoods}</p>
		</div>
	</div>

	<div class="mb-8 grid gap-4 sm:grid-cols-2">
		<section class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
			<h2 class="mb-4 text-xl">Meals last 14 days</h2>
			{#if dailyCounts.isLoading}
				<p class="text-sm text-[var(--muted)]">Loading...</p>
			{:else if dailyCounts.error}
				<p class="text-sm text-red-600">{dailyCounts.error.toString()}</p>
			{:else if dailyCounts.data}
				<MealsPerDayChart data={dailyCounts.data} />
			{/if}
		</section>

		<section class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
			<h2 class="mb-4 text-xl">Most eaten foods</h2>
			<TopFoodsChart foods={topFoods} />
		</section>
	</div>

	{#if hasEnoughHistory}
		<section class="mb-8">
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
						<p class="text-sm text-[var(--muted)]">Based on your habits, try eating less often:</p>
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
		<section class="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
			<p class="text-sm text-[var(--muted)]">Food recommendations</p>
			<p class="mt-1">
				{#if daysOfHistory === 0}
					Log meals for 30 days to unlock recommendations.
				{:else}
					{daysOfHistory} of 30 days logged. {daysUntilRecommend} more to unlock recommendations.
				{/if}
			</p>
		</section>
	{/if}

	<section>
		<h2 class="mb-3 text-2xl">Recent meals</h2>
		{#if recentLogs.isLoading}
			<p class="text-[var(--muted)]">Loading...</p>
		{:else if recentLogs.error}
			<p class="text-red-600">{recentLogs.error.toString()}</p>
		{:else if recentLogs.data && recentLogs.data.length > 0}
			<ul
				class="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]"
			>
				{#each recentLogs.data as log (log._id)}
					<li
						class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
					>
						<span class="font-medium">{log.foodName}</span>
						<span class="text-sm text-[var(--muted)]">{formatDateTime(log.eatenAt)}</span>
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
{/if}
