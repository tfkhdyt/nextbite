<script lang="ts">
	type FoodStat = { name: string; eatCount: number };

	let { foods }: { foods: FoodStat[] } = $props();

	const maxCount = $derived(Math.max(1, ...foods.map((f) => f.eatCount)));
	const hasFoods = $derived(foods.length > 0);

	const width = 280;
	const rowH = 28;
	const labelW = 100;
	const barPad = 8;
	const height = $derived(foods.length * rowH);
	const barMaxW = width - labelW - barPad;
</script>

{#if !hasFoods}
	<p class="text-sm text-[var(--muted)]">Log meals to see rankings.</p>
{:else}
	<svg viewBox="0 0 {width} {height}" class="w-full" role="img" aria-label="Top foods by eat count">
		{#each foods as food, i (food.name)}
			{@const barW = (food.eatCount / maxCount) * barMaxW}
			{@const y = i * rowH + 6}
			<text x="0" y={y + 12} class="fill-[var(--ink)] text-[11px]" dominant-baseline="middle">
				{food.name.length > 14 ? food.name.slice(0, 13) + '…' : food.name}
			</text>
			<rect
				x={labelW}
				{y}
				width={barW}
				height={16}
				rx="3"
				class="fill-[var(--accent)]"
				opacity="0.85"
			>
				<title>{food.name}: {food.eatCount} {food.eatCount === 1 ? 'time' : 'times'}</title>
			</rect>
			<text
				x={labelW + barW + 4}
				y={y + 12}
				class="fill-[var(--muted)] text-[10px]"
				dominant-baseline="middle"
			>
				{food.eatCount}
			</text>
		{/each}
	</svg>
{/if}
