<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import { knowledgeStore } from '$lib/store';
	import { Sections } from '$lib/section';
</script>

<Section section={Sections.Knowledge}>
	<svelte:fragment slot="list-items">
		{#if $knowledgeStore && $knowledgeStore.length > 0}
			{#each $knowledgeStore as knowledge}
				<SectionListItem
					section={Sections.Knowledge}
					id={knowledge.id}
					title={knowledge.name}
					subtitle={knowledge.updated_at}
				/>
			{/each}
		{:else}
			<EmptyMessage>No knowledge</EmptyMessage>
		{/if}
	</svelte:fragment>

	<slot />
</Section>
