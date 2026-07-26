<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import { formatDateTime } from '$lib/format';

	const foods = useQuery(api.foods.withStats, () => ({}));
</script>

<svelte:head>
	<title>Foods · Food Logs</title>
</svelte:head>

<h1 class="mb-2 text-4xl">Foods</h1>
<p class="mb-6 text-[var(--muted)]">Sorted by how often you eat them (least first).</p>

{#if foods.isLoading}
	<p class="text-[var(--muted)]">Loading...</p>
{:else if foods.error}
	<p class="text-red-600">{foods.error.toString()}</p>
{:else if foods.data && foods.data.length > 0}
	<div class="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-[var(--border)] bg-[var(--bg)]">
				<tr>
					<th class="px-4 py-3 font-medium text-[var(--muted)]">Food</th>
					<th class="px-4 py-3 font-medium text-[var(--muted)]">Times eaten</th>
					<th class="px-4 py-3 font-medium text-[var(--muted)]">Last eaten</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-[var(--border)]">
				{#each foods.data as food}
					<tr>
						<td class="px-4 py-3 font-medium">{food.name}</td>
						<td class="px-4 py-3">{food.eatCount}</td>
						<td class="px-4 py-3 text-[var(--muted)]">
							{food.lastEatenAt ? formatDateTime(food.lastEatenAt) : 'Never'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="text-[var(--muted)]">No foods yet. <a href="/logs" class="text-[var(--accent)] underline">Log a meal</a> to get started.</p>
{/if}
