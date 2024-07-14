<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Sitemap } from '$lib/sitemap';
	import { knowledgeStore } from '$lib/store';
	import ButtonDelete from './ButtonDelete.svelte';

	export let sitemap: Sitemap;
	export let id: string;
	export let title: string;
	export let subtitle: string;

	const isSession = sitemap === Sitemap.SESSIONS;

	function deleteKnowledge() {
		if ($knowledgeStore) {
			const updatedKnowledge = $knowledgeStore.filter((s) => s.id !== id);
			$knowledgeStore = updatedKnowledge;
		}
		goto('/knowledge');
	}
</script>

{#key id}
	<div
		class="section-list-item {$page.url.pathname.includes(id) ? 'section-list-item--active' : ''}"
	>
		<nav class="section-list-item__delete">
			<ButtonDelete deleteRecord={deleteKnowledge} />
		</nav>

		<a
			class="section-list-item__a"
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
	</div>
{/key}

<style lang="scss">
	.section-list-item {
		@apply relative flex flex-col border-b last:border-b-0 hover:bg-shade-1;
	}

	.section-list-item:hover .section-list-item__delete {
		@apply opacity-100;
	}

	.section-list-item__delete {
		@apply absolute bottom-0 right-0 top-0 z-10 opacity-0;
	}

	.section-list-item--active {
		@apply bg-shade-1;
	}

	.section-list-item__a {
		@apply relative z-0 px-6 py-3;
	}

	.section-list-item__title {
		@apply max-w-full truncate whitespace-nowrap text-sm font-bold;
	}

	.section-list-item__subtitle {
		@apply flex max-w-full gap-x-2 truncate whitespace-nowrap text-sm;
	}

	.section-list-item:hover .section-list-item__delete {
		@apply opacity-100;
	}
</style>
