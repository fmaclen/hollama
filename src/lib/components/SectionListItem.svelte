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

	let confirmDeletion: boolean = false;
	const isSession = sitemap === Sitemap.SESSIONS;

	function deleteKnowledge() {
		if ($knowledgeStore) {
			const updatedKnowledge = $knowledgeStore.filter((s) => s.id !== id);
			$knowledgeStore = updatedKnowledge;
		}
		goto('/knowledge');
	}
</script>

<!-- Need to use `#key id` to re-render the delete nav after deletion -->
{#key id}
	<div
		class="section-list-item {$page.url.pathname.includes(id) ? 'section-list-item--active' : ''} {confirmDeletion ? 'section-list-item--confirm-deletion' : ''}"
	>
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

		<nav class="section-list-item__delete">
			<ButtonDelete {confirmDeletion} deleteRecord={deleteKnowledge} />
		</nav>
	</div>
{/key}

<style lang="scss">
	@import '$lib/mixins.scss';

	.section-list-item {
		@include delete-record-overlay;
		@apply flex flex-row items-center justify-between border-b pr-3 last:border-b-0 hover:bg-shade-1;
	}

	.section-list-item:hover .section-list-item__delete {
		@apply opacity-100;
	}

	.section-list-item__delete {
		@apply opacity-0;
	}

	.section-list-item--active {
		@apply bg-shade-1;
	}

	.section-list-item__a {
		@apply relative z-0 overflow-hidden text-ellipsis px-6 py-3;
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
