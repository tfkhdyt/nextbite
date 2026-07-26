<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import { setupConvex } from 'convex-svelte';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();

	if (PUBLIC_CONVEX_URL) {
		setupConvex(PUBLIC_CONVEX_URL);
	}

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/logs', label: 'Logs' },
		{ href: '/foods', label: 'Foods' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-dvh">
	{#if data.authenticated}
		<header class="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
			<div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
				<a href="/dashboard" class="brand text-2xl text-[var(--accent)]">Food Logs</a>
				<nav class="flex items-center gap-1 text-sm">
					{#each navItems as item}
						<a
							href={item.href}
							class="rounded px-3 py-1.5 transition-colors {$page.url.pathname === item.href
								? 'bg-[var(--accent)] text-white'
								: 'text-[var(--muted)] hover:text-[var(--ink)]'}"
						>
							{item.label}
						</a>
					{/each}
					<a
						href="/logout"
						class="ml-2 rounded px-3 py-1.5 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
					>
						Sign out
					</a>
				</nav>
			</div>
		</header>
	{/if}

	<main class="mx-auto max-w-3xl px-4 py-8">
		{#if !PUBLIC_CONVEX_URL && data.authenticated}
			<p class="mb-6 rounded border border-[var(--warn)] bg-amber-50 px-4 py-3 text-sm text-[var(--warn)]">
				Set <code class="font-mono">PUBLIC_CONVEX_URL</code> in your <code class="font-mono">.env</code>
				and run <code class="font-mono">npx convex dev</code>.
			</p>
		{/if}
		{@render children()}
	</main>
</div>
