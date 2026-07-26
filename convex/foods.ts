import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

function normalizeName(name: string) {
	return name.trim().toLowerCase();
}

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('foods').order('desc').collect();
	}
});

export const upsert = mutation({
	args: { name: v.string() },
	handler: async (ctx, { name }) => {
		const trimmed = name.trim();
		if (!trimmed) throw new Error('Food name is required');

		const normalizedName = normalizeName(trimmed);
		const existing = await ctx.db
			.query('foods')
			.withIndex('by_normalized_name', (q) => q.eq('normalizedName', normalizedName))
			.unique();

		if (existing) return existing._id;

		return await ctx.db.insert('foods', {
			name: trimmed,
			normalizedName,
			createdAt: Date.now()
		});
	}
});

export const withStats = query({
	args: {},
	handler: async (ctx) => {
		const foods = await ctx.db.query('foods').collect();
		const stats = await Promise.all(
			foods.map(async (food) => {
				const logs = await ctx.db
					.query('logs')
					.withIndex('by_food_id', (q) => q.eq('foodId', food._id))
					.collect();
				const eatCount = logs.length;
				const lastEatenAt =
					eatCount > 0 ? Math.max(...logs.map((log) => log.eatenAt)) : null;
				return { ...food, eatCount, lastEatenAt };
			})
		);

		return stats.sort((a, b) => {
			if (a.eatCount !== b.eatCount) return a.eatCount - b.eatCount;
			const aLast = a.lastEatenAt ?? 0;
			const bLast = b.lastEatenAt ?? 0;
			if (aLast !== bLast) return aLast - bLast;
			return a.name.localeCompare(b.name);
		});
	}
});

export const recommendLeastEaten = query({
	args: {},
	handler: async (ctx) => {
		const stats = await ctx.db.query('foods').collect();
		if (stats.length === 0) return null;

		const withCounts = await Promise.all(
			stats.map(async (food) => {
				const logs = await ctx.db
					.query('logs')
					.withIndex('by_food_id', (q) => q.eq('foodId', food._id))
					.collect();
				const eatCount = logs.length;
				const lastEatenAt =
					eatCount > 0 ? Math.max(...logs.map((log) => log.eatenAt)) : null;
				return { food, eatCount, lastEatenAt };
			})
		);

		withCounts.sort((a, b) => {
			if (a.eatCount !== b.eatCount) return a.eatCount - b.eatCount;
			const aLast = a.lastEatenAt ?? 0;
			const bLast = b.lastEatenAt ?? 0;
			if (aLast !== bLast) return aLast - bLast;
			return a.food.name.localeCompare(b.food.name);
		});

		const pick = withCounts[0];
		return {
			_id: pick.food._id,
			name: pick.food.name,
			eatCount: pick.eatCount,
			lastEatenAt: pick.lastEatenAt
		};
	}
});
