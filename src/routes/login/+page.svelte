<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="mx-auto max-w-sm pt-16">
	<div class="mb-8 text-center">
		<h1 class="brand mb-2 text-5xl text-[var(--accent)]">Food Logs</h1>
		<p class="text-[var(--muted)]">Track what you eat, one meal at a time.</p>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div>
			<label for="password" class="mb-1 block text-sm font-medium text-[var(--muted)]">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				autocomplete="current-password"
				class="w-full rounded-lg border-[var(--border)] bg-[var(--surface)] px-3 py-2"
			/>
		</div>

		{#if form?.error}
			<p class="text-sm text-red-600">{form.error}</p>
		{/if}

		<button
			type="submit"
			class="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
		>
			Sign in
		</button>
	</form>
</div>
