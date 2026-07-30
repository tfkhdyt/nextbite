<script lang="ts">
	import { resolve } from '$app/paths';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import { formatDateTime } from '$lib/format';

	const foods = useQuery(api.foods.withStats, () => ({}));
	// ponytail: withStats reads whole foods table + all matching logs; client slice only.
	// Ceiling: grows with every food/log. Upgrade: denormalize eatCount/lastEatenAt onto foods, index, .paginate().
	let visibleCount = $state(24);
	const visible = $derived((foods.data ?? []).slice(0, visibleCount));
	const hasMore = $derived((foods.data?.length ?? 0) > visibleCount);
</script>

<svelte:head>
	<title>Foods · NextBite</title>
</svelte:head>

<h1 class="mb-2 text-3xl sm:text-4xl">Foods</h1>
<p class="mb-6 text-[var(--muted)]">Sorted by how often you eat them (least first).</p>

{#if foods.isLoading}
	<p class="text-[var(--muted)]">Loading...</p>
{:else if foods.error}
	<p class="text-red-600">{foods.error.toString()}</p>
{:else if foods.data && foods.data.length > 0}
	<ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
		{#each visible as food (food._id)}
			<li class="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
				<div class="flex items-baseline justify-between gap-4">
					<span class="font-medium">{food.name}</span>
					<span class="shrink-0 text-sm text-[var(--muted)]">
						{food.eatCount}
						{food.eatCount === 1 ? 'time' : 'times'}
					</span>
				</div>
				<p class="mt-0.5 text-sm text-[var(--muted)]">
					Last eaten {food.lastEatenAt ? formatDateTime(food.lastEatenAt) : 'never'}
				</p>
			</li>
		{/each}
	</ul>
	{#if hasMore}
		<button
			type="button"
			onclick={() => (visibleCount += 24)}
			class="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg)] sm:w-auto"
		>
			Load more
		</button>
	{/if}
{:else}
	<p class="text-[var(--muted)]">
		No foods yet.
		<a href={resolve('/logs')} class="text-[var(--accent)] underline">Log a meal</a> to get started.
	</p>
{/if}
