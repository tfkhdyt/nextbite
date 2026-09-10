<script lang="ts">
	import './layout.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { setupConvex } from 'convex-svelte';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { children, data } = $props();

	if (PUBLIC_CONVEX_URL) {
		setupConvex(PUBLIC_CONVEX_URL);
	}

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/logs', label: 'Logs' },
		{ href: '/foods', label: 'Foods' }
	] as const;

	function isCurrent(href: string) {
		return page.url.pathname === href;
	}

	function linkTone(href: string) {
		return isCurrent(href)
			? 'bg-[var(--btn)] text-[var(--btn-fg)]'
			: 'text-[var(--muted)] hover:text-[var(--ink)] active:text-[var(--ink)]';
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class={[
		'min-h-dvh',
		data.authenticated &&
			'[scroll-padding-bottom:calc(3.25rem+env(safe-area-inset-bottom))] pb-[calc(3.25rem+env(safe-area-inset-bottom))] sm:scroll-pb-0 sm:pb-0'
	]}
>
	<a
		href="#main"
		class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:bg-[var(--surface)] focus:px-3 focus:py-2 focus:text-[var(--ink)]"
	>
		Skip to content
	</a>
	<header class="border-b border-[var(--border)] bg-[var(--surface)]">
		<div class="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:gap-3 sm:py-3">
			{#if data.authenticated}
				<a href={resolve('/dashboard')} class="brand text-xl text-[var(--accent)] sm:text-2xl"
					>NextBite</a
				>
			{:else}
				<span class="brand text-xl text-[var(--accent)] sm:text-2xl">NextBite</span>
			{/if}

			{#if data.authenticated}
				<nav
					class="hidden flex-1 items-center justify-end gap-1 text-sm sm:flex"
					aria-label="Primary"
				>
					{#each navItems as item (item.href)}
						<a
							href={resolve(item.href)}
							aria-current={isCurrent(item.href) ? 'page' : undefined}
							class="inline-flex min-h-11 items-center rounded px-3 py-2.5 transition-colors {linkTone(
								item.href
							)}"
						>
							{item.label}
						</a>
					{/each}
				</nav>
			{/if}

			<div class="ml-auto flex items-center gap-2">
				<ThemeToggle />
				{#if data.authenticated}
					<a
						href={resolve('/logout')}
						data-sveltekit-reload
						class="inline-flex min-h-11 items-center rounded px-3 py-2.5 text-[var(--muted)] transition-colors hover:text-[var(--ink)] active:text-[var(--ink)]"
					>
						Sign out
					</a>
				{/if}
			</div>
		</div>
	</header>

	<main id="main" class="mx-auto max-w-6xl px-4 py-5 sm:py-8">
		{#if !PUBLIC_CONVEX_URL && data.authenticated}
			<p
				class="mb-6 rounded border border-[var(--warn)] bg-[var(--warn-bg)] px-4 py-3 text-sm text-[var(--warn)]"
			>
				Set <code class="font-mono">PUBLIC_CONVEX_URL</code> in your
				<code class="font-mono">.env</code>
				and run <code class="font-mono">npx convex dev</code>.
			</p>
		{/if}
		{@render children()}
	</main>

	{#if data.authenticated}
		<nav
			class="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] sm:hidden"
			aria-label="Primary"
		>
			<ul class="mx-auto grid max-w-6xl grid-cols-3">
				{#each navItems as item (item.href)}
					<li>
						<a
							href={resolve(item.href)}
							aria-current={isCurrent(item.href) ? 'page' : undefined}
							class="flex min-h-11 items-center justify-center px-2 text-sm transition-colors {linkTone(
								item.href
							)}"
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
</div>
