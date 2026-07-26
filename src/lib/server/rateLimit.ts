import { error, type RequestEvent } from '@sveltejs/kit';

type RateLimiterBinding = {
	limit(opts: { key: string }): Promise<{ success: boolean }>;
};

export async function enforceRateLimit(
	event: RequestEvent,
	bindingName: 'LOGIN_RATE_LIMITER' | 'APP_RATE_LIMITER'
): Promise<void> {
	const env = event.platform?.env;
	if (!env) return;

	const limiter = env[bindingName] as RateLimiterBinding | undefined;
	if (!limiter) return;

	const { success } = await limiter.limit({ key: event.getClientAddress() });
	if (!success) error(429, 'Too many requests');
}
