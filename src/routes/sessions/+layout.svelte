<script lang="ts">
	import { sessionsStore } from '$lib/store';
	import { Sitemap } from '$lib/sitemap';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import { formatSessionMetadata, getSessionTitle } from '$lib/sessions';
	import i18n from '$lib/i18n';
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
			<EmptyMessage>{$i18n.t('sessionsPage.empty')}</EmptyMessage>
		{/if}
	</svelte:fragment>

	<slot />
</Section>
