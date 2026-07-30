import { error, type RequestEvent } from '@sveltejs/kit';

type RateLimiterBinding = {
	limit(opts: { key: string }): Promise<{ success: boolean }>;
};

export async function checkRateLimit(
	event: Pick<RequestEvent, 'platform' | 'getClientAddress'>,
	bindingName: 'LOGIN_RATE_LIMITER' | 'APP_RATE_LIMITER'
): Promise<boolean> {
	const env = event.platform?.env;
	if (!env) return true;

	const limiter = env[bindingName] as RateLimiterBinding | undefined;
	if (!limiter) return true;

	const { success } = await limiter.limit({ key: event.getClientAddress() });
	return success;
}

export async function enforceRateLimit(
	event: RequestEvent,
	bindingName: 'LOGIN_RATE_LIMITER' | 'APP_RATE_LIMITER'
): Promise<void> {
	if (!(await checkRateLimit(event, bindingName))) {
		error(429, 'Too many requests');
	}
}
