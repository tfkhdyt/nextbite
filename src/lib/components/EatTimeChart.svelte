<script lang="ts">
	import { BarChart, Tooltip, defaultChartPadding } from 'layerchart';
	import MealTypeIcon from '$lib/components/MealTypeIcon.svelte';
	import { mealTypeClass, type MealType } from '$lib/format';

	type HourCount = { hour: number; count: number };

	let { data }: { data: HourCount[] } = $props();

	const mealOrder = ['breakfast', 'lunch', 'dinner'] as const satisfies MealType[];
	const mealColors = ['var(--meal-breakfast)', 'var(--meal-lunch)', 'var(--meal-dinner)'] as const;
	const axisHours = [0, 6, 12, 18];

	const hasMeals = $derived(data.some((d) => d.count > 0));
	const chartData = $derived(
		data.map((slot) => ({
			...slot,
			meal: (slot.hour < 11 ? 'breakfast' : slot.hour < 16 ? 'lunch' : 'dinner') as MealType
		}))
	);

	function hourLabel(hour: number) {
		const h = hour % 12 || 12;
		const suffix = hour < 12 ? 'am' : 'pm';
		return `${h}${suffix}`;
	}

	const mealTotals = $derived.by(() => {
		const totals: Record<MealType, number> = { breakfast: 0, lunch: 0, dinner: 0 };
		for (const slot of data) {
			const type: MealType = slot.hour < 11 ? 'breakfast' : slot.hour < 16 ? 'lunch' : 'dinner';
			totals[type] += slot.count;
		}
		return mealOrder.map((type) => ({ type, count: totals[type] }));
	});

	const mealLabels: Record<MealType, string> = {
		breakfast: 'Breakfast',
		lunch: 'Lunch',
		dinner: 'Dinner'
	};
</script>

{#if !hasMeals}
	<p class="text-sm text-[var(--muted)]">Log meals to see when you eat.</p>
{:else}
	<div role="img" aria-label="Distribution of meals by hour of day">
		<BarChart
			data={chartData}
			x="hour"
			y="count"
			c="meal"
			cDomain={[...mealOrder]}
			cRange={[...mealColors]}
			yDomain={[0, null]}
			yNice
			axis="x"
			grid={false}
			rule={false}
			bandPadding={0.25}
			height={140}
			padding={defaultChartPadding({ axis: 'x', left: 4, right: 4, top: 8, bottom: 28 })}
			props={{
				bars: { radius: 2, rounded: 'top', strokeWidth: 0 },
				xAxis: {
					ticks: axisHours,
					format: hourLabel,
					tickLength: 0,
					tickMarks: false,
					rule: false,
					tickLabelProps: { class: 'fill-[var(--muted)] text-[10px]' }
				},
				tooltip: { header: { format: 'none' } }
			}}
		>
			{#snippet tooltip()}
				<Tooltip.Root>
					{#snippet children({ data: tip })}
						{@const meal = tip.meal as MealType}
						<Tooltip.Header>{hourLabel(tip.hour)}</Tooltip.Header>
						<Tooltip.List>
							<Tooltip.Item
								label={mealLabels[meal]}
								value={tip.count}
								format={(v) => `${Math.round(Number(v))} ${Number(v) === 1 ? 'meal' : 'meals'}`}
							/>
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</BarChart>
	</div>
	<ul class="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
		{#each mealTotals as meal (meal.type)}
			<li class="inline-flex items-center gap-1.5 {mealTypeClass(meal.type)}">
				<MealTypeIcon type={meal.type} />
				<span>{mealLabels[meal.type]}</span>
				<span class="text-[var(--muted)]">{meal.count}</span>
			</li>
		{/each}
	</ul>
{/if}
