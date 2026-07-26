import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { SESSION_SECRET } from '$env/static/private';
import { COOKIE_NAME, SESSION_MAX_AGE, createSessionToken, verifySessionToken } from '$lib/server/session';

const protectedPrefixes = ['/dashboard', '/logs', '/foods'];

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(COOKIE_NAME);
	const authenticated = token ? await verifySessionToken(token, SESSION_SECRET) : false;
	event.locals.authenticated = authenticated;

	const { pathname } = event.url;
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
