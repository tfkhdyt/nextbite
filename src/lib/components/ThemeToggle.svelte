<script lang="ts">
	import { theme } from '$lib/theme.svelte';
</script>

<button
	type="button"
	onclick={() => theme.toggle()}
	aria-pressed={theme.current === 'dark'}
	aria-label={theme.current === 'dark' ? 'Switch to light' : 'Switch to dark'}
	class="inline-flex min-h-11 min-w-11 items-center justify-center rounded px-3 text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
>
	{theme.current === 'dark' ? 'Light' : 'Dark'}
</button>
