import { query, mutation, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_DAYS_FOR_RECOMMEND = 30;

function normalizeName(name: string) {
	return name.trim().toLowerCase();
}

async function upsertFood(ctx: MutationCtx, name: string) {
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

export const list = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, { limit = 50 }) => {
		const logs = await ctx.db
			.query('logs')
			.withIndex('by_eaten_at')
			.order('desc')
			.take(limit);

		return await Promise.all(
			logs.map(async (log) => {
				const food = await ctx.db.get(log.foodId);
				return {
					_id: log._id,
					eatenAt: log.eatenAt,
					note: log.note,
					foodId: log.foodId,
					foodName: food?.name ?? 'Unknown'
				};
			})
		);
	}
});

export const add = mutation({
	args: {
		name: v.string(),
		eatenAt: v.number(),
		note: v.optional(v.string())
	},
	handler: async (ctx, { name, eatenAt, note }) => {
		const foodId = await upsertFood(ctx, name);
		return await ctx.db.insert('logs', { foodId, eatenAt, note });
	}
});

export const remove = mutation({
	args: { id: v.id('logs') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	}
});

export const historySummary = query({
	args: { now: v.number() },
	returns: v.object({
		daysOfHistory: v.number(),
		hasEnoughForRecommend: v.boolean(),
		earliestEatenAt: v.union(v.number(), v.null())
	}),
	handler: async (ctx, { now }) => {
		const earliest = await ctx.db.query('logs').withIndex('by_eaten_at').order('asc').first();

		if (!earliest) {
			return { daysOfHistory: 0, hasEnoughForRecommend: false, earliestEatenAt: null };
		}

		const daysOfHistory = (now - earliest.eatenAt) / DAY_MS;

		return {
			daysOfHistory,
			hasEnoughForRecommend: daysOfHistory >= MIN_DAYS_FOR_RECOMMEND,
			earliestEatenAt: earliest.eatenAt
		};
	}
});
