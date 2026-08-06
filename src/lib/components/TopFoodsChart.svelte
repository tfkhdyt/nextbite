<script lang="ts">
	import { BarChart, Tooltip, defaultChartPadding } from 'layerchart';

	type FoodStat = { name: string; eatCount: number };

	let { foods }: { foods: FoodStat[] } = $props();

	const hasFoods = $derived(foods.length > 0);
	const height = $derived(Math.max(foods.length, 1) * 32);
	const rankColors = [
		'var(--green-5)',
		'var(--green-4)',
		'var(--green-3)',
		'var(--green-2)',
		'var(--green-1)'
	];
</script>

{#if !hasFoods}
	<p class="text-sm text-[var(--muted)]">Log meals to see rankings.</p>
{:else}
	<div role="img" aria-label="Top foods by eat count">
		<BarChart
			data={foods}
			x="eatCount"
			y="name"
			c="name"
			cDomain={foods.map((f) => f.name)}
			cRange={rankColors}
			xDomain={[0, null]}
			orientation="horizontal"
			axis="y"
			grid={false}
			rule={false}
			bandPadding={0.35}
			labels={{
				placement: 'outside',
				format: 'integer',
				offset: 6,
				class: 'fill-[var(--muted)] text-[10px]'
			}}
			padding={defaultChartPadding({ axis: 'y', left: 112, right: 40, top: 4, bottom: 4 })}
			{height}
			props={{
				bars: { radius: 3, rounded: 'edge', strokeWidth: 0 },
				yAxis: {
					tickLength: 0,
					tickMarks: false,
					rule: false,
					tickLabelProps: {
						textAnchor: 'end',
						dx: -8,
						truncate: { maxChars: 14, ellipsis: '…' },
						class: 'fill-[var(--ink)] text-[11px]'
					}
				},
				tooltip: { header: { format: 'none' } }
			}}
		>
			{#snippet tooltip()}
				<Tooltip.Root>
					{#snippet children({ data })}
						<Tooltip.Header>{data.name}</Tooltip.Header>
						<Tooltip.List>
							<Tooltip.Item
								label="Logged"
								value={data.eatCount}
								format={(v) => `${Math.round(Number(v))} ${Number(v) === 1 ? 'time' : 'times'}`}
							/>
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</BarChart>
	</div>
{/if}
