<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Sitemap } from '$lib/sitemap';
	import { sessionsStore, deleteStoreItem, knowledgeStore } from '$lib/store';
	import ButtonDelete from './ButtonDelete.svelte';
	import Metadata from './Metadata.svelte';

	export let sitemap: Sitemap;
	export let id: string;
	export let title: string;
	export let subtitle: string;

	const isSession = sitemap === Sitemap.SESSIONS;
	let confirmDeletion: boolean = false;
	
	function deleteRecord() {
		switch (sitemap) {
			case Sitemap.KNOWLEDGE:
				if ($knowledgeStore) $knowledgeStore = deleteStoreItem($knowledgeStore, id);
				goto('/knowledge');
				break;
			case Sitemap.SESSIONS:
				if ($sessionsStore) $sessionsStore = deleteStoreItem($sessionsStore, id);
				goto('/sessions');
				break;
			default:
				break;
		}
	}
</script>

<!-- Need to use `#key id` to re-render the delete nav after deletion -->
{#key id}
	<div
		class="section-list-item {$page.url.pathname.includes(id)
			? 'section-list-item--active'
			: ''} {confirmDeletion ? 'section-list-item--confirm-deletion' : ''}"
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
			<Metadata>
				{subtitle}
			</Metadata>
		</a>

		<nav class="section-list-item__delete">
			<ButtonDelete {confirmDeletion} {deleteRecord} />
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
</style>
