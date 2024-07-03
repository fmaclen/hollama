<script lang="ts">
	import { page } from '$app/stores';
	import { Sitemap } from '$lib/sitemap';

	export let sitemap: Sitemap;
	export let id: string;
	export let title: string;
	export let subtitle: string;

	const isSession = sitemap === Sitemap.SESSIONS;
</script>

<a
	class="section-list-item {$page.url.pathname.includes(id) ? 'bg-accent' : 'hover:bg-accent'}"
	data-testid={isSession ? 'session-item' : 'knowledge-item'}
	aria-label={isSession ? `Session: ${id}` : `Knowledge: ${id}`}
	href={`/${sitemap}/${id}`}
>
	<p class="section-list-item__title">
		{title}
	</p>
	<p class="section-list-item__subtitle">
		{subtitle}
	</p>
</a>

<style lang="scss">
	.section-list-item {
		@apply flex flex-col px-6 py-3;
	}

	.section-list-item__title {
		@apply max-w-full truncate whitespace-nowrap text-sm font-bold text-foreground;
	}

	.section-list-item__subtitle {
		@apply flex max-w-full gap-x-2 truncate whitespace-nowrap text-sm text-muted-foreground;
	}
</style>
