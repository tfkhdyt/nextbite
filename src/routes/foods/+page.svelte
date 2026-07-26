<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import { formatDateTime } from '$lib/format';

	const foods = useQuery(api.foods.withStats, () => ({}));
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
	<ul class="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
		{#each foods.data as food (food._id)}
			<li class="px-4 py-3">
				<div class="flex items-baseline justify-between gap-4">
					<span class="font-medium">{food.name}</span>
					<span class="shrink-0 text-sm text-[var(--muted)]">
						{food.eatCount} {food.eatCount === 1 ? 'time' : 'times'}
					</span>
				</div>
				<p class="mt-0.5 text-sm text-[var(--muted)]">
					Last eaten {food.lastEatenAt ? formatDateTime(food.lastEatenAt) : 'never'}
				</p>
			</li>
		{/each}
	</ul>
{:else}
	<p class="text-[var(--muted)]">No foods yet. <a href="/logs" class="text-[var(--accent)] underline">Log a meal</a> to get started.</p>
{/if}
