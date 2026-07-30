<script lang="ts">
	import { useConvexClient, usePaginatedQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import type { Id } from '../../../convex/_generated/dataModel';
	import MealTypeIcon from '$lib/components/MealTypeIcon.svelte';
	import { formatDateTime, mealTypeClass, mealTypeFromEatenAt } from '$lib/format';

	const client = useConvexClient();
	const logs = usePaginatedQuery(api.logs.listPaginated, () => ({}), { initialNumItems: 10 });

	let foodName = $state('');
	let eatenAt = $state(toLocalInputValue(new Date()));
	let note = $state('');
	let submitting = $state(false);
	let error = $state('');
	let pendingDeleteId = $state<Id<'logs'> | null>(null);

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
		pendingDeleteId = null;
	}
</script>

<svelte:head>
	<title>Logs · NextBite</title>
</svelte:head>

<h1 class="mb-6 text-3xl sm:text-4xl">Logs</h1>

<div class="lg:grid lg:grid-cols-[22rem_1fr] lg:items-start lg:gap-8">
	<form
		onsubmit={addLog}
		class="mb-8 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:sticky lg:top-24 lg:mb-0"
	>
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
			<label for="note" class="mb-1 block text-sm font-medium text-[var(--muted)]"
				>Note (optional)</label
			>
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
		<div class="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
			<h2 class="mb-4 text-xl">History</h2>
			{#if logs.status === 'LoadingFirstPage'}
				<p class="text-[var(--muted)]">Loading...</p>
			{:else if logs.error}
				<p class="text-red-600">{logs.error.toString()}</p>
			{:else if logs.results.length > 0}
				<ul class="divide-y divide-[var(--border)]">
					{#each logs.results as log (log._id)}
						{@const meal = mealTypeFromEatenAt(log.eatenAt)}
						<li class="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
							<div>
								<p class="font-medium">{log.foodName}</p>
								<p class="inline-flex items-center gap-1.5 text-sm {mealTypeClass(meal)}">
									<MealTypeIcon type={meal} />
									{formatDateTime(log.eatenAt)}
								</p>
								{#if log.note}
									<p class="mt-0.5 text-sm text-[var(--muted)]">{log.note}</p>
								{/if}
							</div>
							{#if pendingDeleteId === log._id}
								<div class="flex shrink-0 items-center gap-1">
									<button
										type="button"
										onclick={() => removeLog(log._id)}
										class="inline-flex min-h-11 items-center px-2 text-sm font-medium text-red-600 hover:underline"
									>
										Confirm
									</button>
									<button
										type="button"
										onclick={() => (pendingDeleteId = null)}
										class="inline-flex min-h-11 items-center px-2 text-sm text-[var(--muted)] hover:underline"
									>
										Cancel
									</button>
								</div>
							{:else}
								<button
									type="button"
									onclick={() => (pendingDeleteId = log._id)}
									aria-label="Delete"
									class="inline-flex size-11 shrink-0 items-center justify-center text-red-600 transition-colors hover:text-red-700"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="size-4"
										aria-hidden="true"
									>
										<path d="M3 6h18" />
										<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
										<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
										<line x1="10" x2="10" y1="11" y2="17" />
										<line x1="14" x2="14" y1="11" y2="17" />
									</svg>
								</button>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-[var(--muted)]">No logs yet.</p>
			{/if}
		</div>
		{#if logs.status === 'CanLoadMore' || logs.status === 'LoadingMore'}
			<button
				type="button"
				onclick={() => logs.loadMore(10)}
				disabled={logs.status === 'LoadingMore'}
				class="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg)] disabled:opacity-50 sm:w-auto"
			>
				{logs.status === 'LoadingMore' ? 'Loading...' : 'Load more'}
			</button>
		{/if}
	</section>
</div>
