<script lang="ts">
	import { onMount } from 'svelte';
	import { sessionsStore } from '$lib/store';
	import { generateStorageId } from '$lib/utils';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import { Sections } from '$lib/section';

	let newSessionId: string;

	function setSessionId() {
		newSessionId = generateStorageId();
	}

	onMount(setSessionId);
</script>

<Section section={Sections.Sessions}>
	<svelte:fragment slot="list-items">
		{#if $sessionsStore && $sessionsStore.length > 0}
			<!-- Using slice() to reverse $sessionsStore without affecting the original array -->
			{#each $sessionsStore.slice().reverse() as session (session.id)}
				<SectionListItem
					section={Sections.Sessions}
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
