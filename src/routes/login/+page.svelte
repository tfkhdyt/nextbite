<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>Sign in · NextBite</title>
</svelte:head>

<div class="mx-auto max-w-sm pt-4 sm:pt-16">
	<div class="mb-6 sm:mb-8">
		<h1 class="mb-2 text-3xl sm:text-4xl">Sign in</h1>
		<p class="text-[var(--muted)]">Log meals. Find what to eat next.</p>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div>
			<label for="password" class="mb-1 block text-sm font-medium text-[var(--muted)]"
				>Password</label
			>
			<input
				id="password"
				name="password"
				type="password"
				required
				autocomplete="current-password"
				class="min-h-11 w-full max-w-full min-w-0 rounded-lg border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base"
			/>
		</div>

		{#if form?.error}
			<p class="text-sm text-[var(--danger)]">{form.error}</p>
		{/if}

		<button
			type="submit"
			class="min-h-11 w-full rounded-lg bg-[var(--btn)] px-4 py-2.5 font-medium text-[var(--btn-fg)] transition-colors hover:bg-[var(--btn-hover)]"
		>
			Sign in
		</button>
	</form>
</div>
