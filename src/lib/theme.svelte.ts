export type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function themeFromDocument(): ThemeName {
	if (typeof document === 'undefined') return 'light';
	return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

let current = $state<ThemeName>(themeFromDocument());

function apply(next: ThemeName) {
	current = next;
	document.documentElement.classList.toggle('dark', next === 'dark');
	localStorage.setItem(STORAGE_KEY, next);
}

export const theme = {
	get current() {
		return current;
	},
	toggle() {
		apply(current === 'dark' ? 'light' : 'dark');
	}
};
