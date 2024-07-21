<script lang="ts">
	import { sessionsStore, updatePageTitle } from '$lib/store';
	import { Sitemap } from '$lib/sitemap';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import { formatSessionMetadata, getSessionTitle } from '$lib/sessions';
	import { page } from '$app/stores';

	// This is necessary for the case in which user is viewing a session and then clicks the Sessions link at the sidebar
	$: if ($page.url.pathname === '/sessions') updatePageTitle('Sessions');
</script>

<RobotsNoIndex />

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
