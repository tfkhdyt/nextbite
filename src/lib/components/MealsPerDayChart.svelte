<script lang="ts">
	type DayCount = { dayStart: number; count: number };

	let { data }: { data: DayCount[] } = $props();

	const maxCount = $derived(Math.max(1, ...data.map((d) => d.count)));
	const hasMeals = $derived(data.some((d) => d.count > 0));

	const width = 280;
	const height = 120;
	const padX = 4;
	const padY = 8;
	const chartW = width - padX * 2;
	const chartH = height - padY * 2;
	const barGap = 2;

	const bars = $derived(
		data.map((day, i) => {
			const barW = data.length > 0 ? (chartW - barGap * (data.length - 1)) / data.length : 0;
			const barH = (day.count / maxCount) * chartH;
			const x = padX + i * (barW + barGap);
			const y = padY + chartH - barH;
			const label = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(
				new Date(day.dayStart)
			);
			return { ...day, barW, barH, x, y, label };
		})
	);
</script>

{#if !hasMeals}
	<p class="text-sm text-[var(--muted)]">No meals in this period.</p>
{:else}
	<svg
		viewBox="0 0 {width} {height}"
		class="w-full"
		role="img"
		aria-label="Meals logged per day for the last {data.length} days"
	>
		{#each bars as bar (bar.dayStart)}
			<rect
				x={bar.x}
				y={bar.y}
				width={bar.barW}
				height={bar.barH}
				rx="2"
				class="fill-[var(--accent)]"
				opacity={bar.count === 0 ? 0.2 : 0.85}
			>
				<title>{bar.label}: {bar.count} {bar.count === 1 ? 'meal' : 'meals'}</title>
			</rect>
		{/each}
	</svg>
	<div class="mt-2 flex justify-between text-xs text-[var(--muted)]">
		<span>{bars[0]?.label}</span>
		<span>{bars[bars.length - 1]?.label}</span>
	</div>
{/if}
