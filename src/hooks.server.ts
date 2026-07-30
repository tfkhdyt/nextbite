import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { SESSION_SECRET } from '$env/static/private';
import { enforceRateLimit } from '$lib/server/rateLimit';
import {
	COOKIE_NAME,
	SESSION_MAX_AGE,
	createSessionToken,
	verifySessionToken
} from '$lib/server/session';

const protectedPrefixes = ['/dashboard', '/logs', '/foods'];

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const isLoginPost = pathname === '/login' && event.request.method === 'POST';

	// Login POST rate limit is enforced in the form action via fail(), so the
	// message can render on the login form instead of the error page.
	if (!isLoginPost) {
		await enforceRateLimit(event, 'APP_RATE_LIMITER');
	}

	const token = event.cookies.get(COOKIE_NAME);
	const authenticated = token ? await verifySessionToken(token, SESSION_SECRET) : false;
	event.locals.authenticated = authenticated;

	const isProtected = protectedPrefixes.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
	const isLogin = pathname === '/login';

	if (isProtected && !authenticated) {
		throw redirect(303, '/login');
	}

	if (isLogin && authenticated) {
		throw redirect(303, '/dashboard');
	}

	return resolve(event);
};

export { COOKIE_NAME, SESSION_MAX_AGE, createSessionToken };
