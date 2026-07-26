export const COOKIE_NAME = 'food_logs_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

async function sign(value: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
	return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function createSessionToken(secret: string): Promise<string> {
	const payload = JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE * 1000 });
	const payloadB64 = btoa(payload);
	const signature = await sign(payloadB64, secret);
	return `${payloadB64}.${signature}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
	const [payloadB64, signature] = token.split('.');
	if (!payloadB64 || !signature) return false;

	const expected = await sign(payloadB64, secret);
	if (signature !== expected) return false;

	try {
		const payload = JSON.parse(atob(payloadB64)) as { exp: number };
		return payload.exp > Date.now();
	} catch {
		return false;
	}
}
