<script lang="ts">
	import type { MealType } from '$lib/format';

	let { type }: { type: MealType } = $props();

	const labels: Record<MealType, string> = {
		breakfast: 'Breakfast',
		lunch: 'Lunch',
		dinner: 'Dinner'
	};
</script>

{#if type === 'breakfast'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="size-3.5 shrink-0"
		aria-hidden="true"
	>
		<path d="M12 3v2" />
		<path d="m4.9 4.9 1.4 1.4" />
		<path d="M3 12h2" />
		<path d="m4.9 19.1 1.4-1.4" />
		<path d="M20 12h1" />
		<path d="m17.7 6.3 1.4-1.4" />
		<circle cx="12" cy="12" r="4" />
		<path d="M8 20h8" />
	</svg>
{:else if type === 'lunch'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="size-3.5 shrink-0"
		aria-hidden="true"
	>
		<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
		<path d="M7 2v20" />
		<path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
	</svg>
{:else}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="size-3.5 shrink-0"
		aria-hidden="true"
	>
		<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
	</svg>
{/if}
<span class="sr-only">{labels[type]}</span>
