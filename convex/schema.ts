import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	foods: defineTable({
		name: v.string(),
		normalizedName: v.string(),
		createdAt: v.number()
	}).index('by_normalized_name', ['normalizedName']),
	logs: defineTable({
		foodId: v.id('foods'),
		eatenAt: v.number(),
		note: v.optional(v.string())
	})
		.index('by_eaten_at', ['eatenAt'])
		.index('by_food_id', ['foodId'])
});
