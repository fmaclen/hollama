<script lang="ts">
	import { page } from '$app/stores';
	import { Sitemap } from '$lib/sitemap';
	import Metadata from './Metadata.svelte';

	export let sitemap: Sitemap;
	export let id: string;
	export let title: string;
	export let subtitle: string;

	const isSession = sitemap === Sitemap.SESSIONS;
</script>

<a
	class="section-list-item {$page.url.pathname.includes(id) ? 'section-list-item--active' : ''}"
	data-testid={isSession ? 'session-item' : 'knowledge-item'}
	aria-label={isSession ? `Session: ${id}` : `Knowledge: ${id}`}
	href={`/${sitemap}/${id}`}
>
	<p class="section-list-item__title">
		{title}
	</p>
	<Metadata>
		{subtitle}
	</Metadata>
</a>

<style lang="scss">
	.section-list-item {
		@apply flex flex-col border-b px-6 py-3 last:border-b-0 hover:bg-shade-1;
	}

	.section-list-item--active {
		@apply bg-shade-1;
	}

	.section-list-item__title {
		@apply max-w-full truncate whitespace-nowrap text-sm font-bold;
	}
</style>
