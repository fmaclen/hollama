<script lang="ts">
	import { page } from '$app/stores';

	export let section: string;
	export let id: string;
	export let title: string;
	export let subtitle: string;
</script>

<a
	data-testid="session-item"
	aria-label={`Session ${id}`}
	href={`/${section}/${id}`}
	class="section-list__a {$page.url.pathname.includes(id) ? 'bg-accent' : 'hover:bg-accent'}"
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
		@apply flex flex-col px-6 py-3 max-w-96;
	}

	.section-list__title {
		@apply max-w-full truncate whitespace-nowrap text-sm font-bold text-foreground;
	}

	.section-list__subtitle {
		@apply flex max-w-full gap-x-2 truncate whitespace-nowrap text-sm text-muted-foreground;
	}
</style>
