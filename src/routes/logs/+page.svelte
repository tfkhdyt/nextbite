<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import type { Id } from '../../../convex/_generated/dataModel';
	import { formatDateTime } from '$lib/format';

	const client = useConvexClient();
	const logs = useQuery(api.logs.list, () => ({ limit: 100 }));

	let foodName = $state('');
	let eatenAt = $state(toLocalInputValue(new Date()));
	let note = $state('');
	let submitting = $state(false);
	let error = $state('');

	function toLocalInputValue(date: Date) {
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
	}

	async function addLog(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		submitting = true;

		try {
			await client.mutation(api.logs.add, {
				name: foodName,
				eatenAt: new Date(eatenAt).getTime(),
				note: note.trim() || undefined
			});
			foodName = '';
			note = '';
			eatenAt = toLocalInputValue(new Date());
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to add log';
		} finally {
			submitting = false;
		}
	}

	async function removeLog(id: Id<'logs'>) {
		await client.mutation(api.logs.remove, { id });
	}
</script>

<svelte:head>
	<title>Logs · Food Logs</title>
</svelte:head>

<h1 class="mb-6 text-3xl sm:text-4xl">Logs</h1>

<form onsubmit={addLog} class="mb-8 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
	<div>
		<label for="food" class="mb-1 block text-sm font-medium text-[var(--muted)]">Food</label>
		<input
			id="food"
			bind:value={foodName}
			required
			placeholder="e.g. oatmeal, chicken salad"
			class="w-full max-w-full min-w-0 rounded-lg border-[var(--border)] bg-white px-3 py-2"
		/>
	</div>
	<div>
		<label for="eatenAt" class="mb-1 block text-sm font-medium text-[var(--muted)]">When</label>
		<input
			id="eatenAt"
			type="datetime-local"
			bind:value={eatenAt}
			required
			class="w-full max-w-full min-w-0 rounded-lg border-[var(--border)] bg-white px-3 py-2"
		/>
	</div>
	<div>
		<label for="note" class="mb-1 block text-sm font-medium text-[var(--muted)]">Note (optional)</label>
		<input
			id="note"
			bind:value={note}
			placeholder="homemade, restaurant, etc."
			class="w-full max-w-full min-w-0 rounded-lg border-[var(--border)] bg-white px-3 py-2"
		/>
	</div>

	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}

	<button
		type="submit"
		disabled={submitting}
		class="w-full rounded-lg bg-[var(--accent)] px-5 py-3 font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50 sm:w-auto"
	>
		{submitting ? 'Adding...' : 'Add log'}
	</button>
</form>

<section>
	<h2 class="mb-3 text-2xl">History</h2>
	{#if logs.isLoading}
		<p class="text-[var(--muted)]">Loading...</p>
	{:else if logs.error}
		<p class="text-red-600">{logs.error.toString()}</p>
	{:else if logs.data && logs.data.length > 0}
		<ul class="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
			{#each logs.data as log (log._id)}
				<li class="flex items-start justify-between gap-4 px-4 py-3">
					<div>
						<p class="font-medium">{log.foodName}</p>
						<p class="text-sm text-[var(--muted)]">{formatDateTime(log.eatenAt)}</p>
						{#if log.note}
							<p class="mt-0.5 text-sm text-[var(--muted)]">{log.note}</p>
						{/if}
					</div>
					<button
						type="button"
						onclick={() => removeLog(log._id)}
						class="inline-flex min-h-11 shrink-0 items-center px-2 text-sm text-red-600 hover:underline"
					>
						Delete
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-[var(--muted)]">No logs yet.</p>
	{/if}
</section>
