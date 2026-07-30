<script lang="ts">
	import { BarChart, Tooltip, defaultChartPadding } from 'layerchart';

	type OverlookedFood = { name: string; daysSince: number; eatCount: number };

	let { foods }: { foods: OverlookedFood[] } = $props();

	const hasFoods = $derived(foods.length > 0);
	const height = $derived(Math.max(foods.length, 1) * 32);

	function daysLabel(value: number) {
		return `${Math.round(value)}d`;
	}
</script>

{#if !hasFoods}
	<p class="text-sm text-[var(--muted)]">
		No neglected repeats yet. Needs foods logged 2+ times, last eaten 3+ days ago.
	</p>
{:else}
	<div role="img" aria-label="Repeat foods longest since last eaten">
		<BarChart
			data={foods}
			x="daysSince"
			y="name"
			xDomain={[0, null]}
			orientation="horizontal"
			axis="y"
			grid={false}
			rule={false}
			bandPadding={0.35}
			labels={{
				placement: 'outside',
				format: daysLabel,
				offset: 6,
				class: 'fill-[var(--muted)] text-[10px]'
			}}
			series={[
				{
					key: 'daysSince',
					value: 'daysSince',
					color: 'var(--accent)',
					props: { radius: 3, rounded: 'edge', strokeWidth: 0, fillOpacity: 0.85 }
				}
			]}
			padding={defaultChartPadding({ axis: 'y', left: 112, right: 40, top: 4, bottom: 4 })}
			{height}
			props={{
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
								label="Last eaten"
								value={data.daysSince}
								format={(v) =>
									`${Math.round(Number(v))} ${Number(v) === 1 ? 'day ago' : 'days ago'}`}
							/>
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
