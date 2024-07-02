<script lang="ts">
	import { onMount } from 'svelte';
	import { sessionsStore } from '$lib/store';
	import { generateStorageId } from '$lib/utils';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import { Sitemap } from '$lib/sitemap';
</script>

<Section sitemap={Sitemap.SESSIONS}>
	<svelte:fragment slot="list-items">
		{#if $sessionsStore && $sessionsStore.length > 0}
			<!-- Using slice() to reverse $sessionsStore without affecting the original array -->
			{#each $sessionsStore.slice().reverse() as session (session.id)}
				<SectionListItem
					sitemap={Sitemap.SESSIONS}
					id={session.id}
					title={session.messages[0].content}
					subtitle={session.model}
				/>
			{/each}
		{:else}
			<EmptyMessage>No sessions</EmptyMessage>
		{/if}
	</svelte:fragment>

	<slot />
</Section>
