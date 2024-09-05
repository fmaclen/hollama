<script lang="ts">
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import i18n from '$lib/i18n';
	import { Sitemap } from '$lib/sitemap';
	import { knowledgeStore } from '$lib/store';
	import { formatTimestampToNow } from '$lib/utils';
</script>

<RobotsNoIndex />

<Section sitemap={Sitemap.KNOWLEDGE}>
	<svelte:fragment slot="list-items">
		{#if $knowledgeStore && $knowledgeStore.length > 0}
			{#each $knowledgeStore as knowledge}
				<SectionListItem
					sitemap={Sitemap.KNOWLEDGE}
					id={knowledge.id}
					title={knowledge.name}
					subtitle={formatTimestampToNow(knowledge.updatedAt)}
				/>
			{/each}
		{:else}
			<EmptyMessage>{$i18n.t('knowledgePage.empty')}</EmptyMessage>
		{/if}
	</svelte:fragment>

	<slot />
</Section>
