<script lang="ts">
	import { sessionsStore } from '$lib/store';
	import { Sitemap } from '$lib/sitemap';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import { formatSessionMetadata } from '$lib/sessions';
</script>

<RobotsNoIndex />

<Section sitemap={Sitemap.SESSIONS}>
	<svelte:fragment slot="list-items">
		{#if $sessionsStore && $sessionsStore.length > 0}
			{#each $sessionsStore as session}
				{@const hasKnowledge = session.messages[0].knowledge}
				<SectionListItem
					sitemap={Sitemap.SESSIONS}
					id={session.id}
					title={hasKnowledge ? session.messages[1].content : session.messages[0].content}
					subtitle={formatSessionMetadata(session)}
				/>
			{/each}
		{:else}
			<EmptyMessage>No sessions</EmptyMessage>
		{/if}
	</svelte:fragment>

	<slot />
</Section>
