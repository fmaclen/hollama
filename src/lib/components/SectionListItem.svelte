<script lang="ts">
	import { page } from '$app/stores';
	import { Sitemap } from '$lib/sitemap';

	export let sitemap: Sitemap;
	export let id: string;
	export let title: string;
	export let subtitle: string;
</script>

<a
	class="section-list__a {$page.url.pathname.includes(id) ? 'bg-accent' : 'hover:bg-accent'}"
	data-testid={sitemap === Sitemap.SESSIONS ? 'session-item' : 'knowledge-item'}
	aria-label={`Session ${id}`}
	href={`/${sitemap}/${id}`}
>
	<p class="section-list__title">
		{title}
	</p>
	<p class="section-list__subtitle">
		{subtitle}
	</p>
</a>

<style lang="scss">
	.section-list__a {
		@apply flex flex-col px-6 py-3;
	}

	.section-list__title {
		@apply max-w-full truncate whitespace-nowrap text-sm font-bold text-foreground;
	}

	.section-list__subtitle {
		@apply flex max-w-full gap-x-2 truncate whitespace-nowrap text-sm text-muted-foreground;
	}
</style>
