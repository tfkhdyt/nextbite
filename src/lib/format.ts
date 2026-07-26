export type MealType = 'breakfast' | 'lunch' | 'dinner';

/** Local-hour buckets: breakfast <11, lunch 11–15, dinner 16+. */
export function mealTypeFromEatenAt(timestamp: number): MealType {
	const hour = new Date(timestamp).getHours();
	if (hour < 11) return 'breakfast';
	if (hour < 16) return 'lunch';
	return 'dinner';
}

export function mealTypeClass(type: MealType): string {
	return `meal-${type}`;
}

export function formatDateTime(timestamp: number | null): string {
	if (timestamp == null) return 'Never';
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(new Date(timestamp));
}

export function formatRelative(timestamp: number | null): string {
	if (timestamp == null) return 'never logged';
	const diff = Date.now() - timestamp;
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	if (days === 0) return 'today';
	if (days === 1) return 'yesterday';
	if (days < 7) return `${days} days ago`;
	return formatDateTime(timestamp);
}
