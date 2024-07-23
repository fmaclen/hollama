<script lang="ts">
	import { sessionsStore } from '$lib/store';
	import { Sitemap } from '$lib/sitemap';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import { formatSessionMetadata, getSessionTitle } from '$lib/sessions';
	import Head from '$lib/components/Head.svelte';
</script>

<RobotsNoIndex />

<Head title="Sessions" />
<Section sitemap={Sitemap.SESSIONS}>
	<svelte:fragment slot="list-items">
		{#if $sessionsStore && $sessionsStore.length > 0}
			{#each $sessionsStore as session}
				<SectionListItem
					sitemap={Sitemap.SESSIONS}
					id={session.id}
					title={getSessionTitle(session)}
					subtitle={formatSessionMetadata(session)}
				/>
			{/each}
		{:else}
			<EmptyMessage>No sessions</EmptyMessage>
		{/if}
	</svelte:fragment>

	<slot />
</Section>
