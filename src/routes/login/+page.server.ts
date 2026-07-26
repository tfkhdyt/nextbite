import { fail, redirect } from '@sveltejs/kit';
import { APP_PASSWORD, SESSION_SECRET } from '$env/static/private';
import { COOKIE_NAME, SESSION_MAX_AGE, createSessionToken } from '$lib/server/session';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');

		if (typeof password !== 'string' || password !== APP_PASSWORD) {
			return fail(400, { error: 'Invalid password' });
		}

		const token = await createSessionToken(SESSION_SECRET);
		cookies.set(COOKIE_NAME, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: SESSION_MAX_AGE
		});

		throw redirect(303, '/dashboard');
	}
};
