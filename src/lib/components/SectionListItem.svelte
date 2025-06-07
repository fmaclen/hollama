<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { page } from '$app/state';
	import { sessionsStore } from '$lib/localStorage';
	import { saveSession } from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';

	import ButtonDelete from './ButtonDelete.svelte';
	import ButtonEdit from './ButtonEdit.svelte';
	import Metadata from './Metadata.svelte';

	interface Props {
		sitemap: Sitemap;
		id: string;
		title: string;
		subtitle: string;
	}

	let { sitemap, id, title, subtitle }: Props = $props();
	let isEditing = $state(false);
	let editedTitle = $state(title);
	let titleInput: HTMLInputElement | null = $state(null);
	let isDeleting = $state(false);

	const isSession = sitemap === Sitemap.SESSIONS;

	$effect(() => {
		if (isEditing && titleInput) titleInput.focus();
	});

	function handleTitleEdit() {
		if (isSession && editedTitle !== title) {
			const session = $sessionsStore.find((s) => s.id === id);
			if (session) {
				session.title = editedTitle;
				saveSession(session);
			}
		}
		isEditing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleTitleEdit();
	}

	function cancelEdit() {
		editedTitle = title;
		isEditing = false;
	}
</script>

<!-- Need to use `#key id` to re-render the delete nav after deletion -->
{#key id}
	<div
		class="section-list-item"
		class:section-list-item--active={page.url.pathname.includes(id)}
		class:section-list-item--confirm-deletion={isDeleting}
		class:section-list-item--editing={isEditing}
	>
		{#if isEditing && isSession}
			<div class="section-list-item__content">
				<input
					bind:this={titleInput}
					bind:value={editedTitle}
					class="section-list-item__title-input"
					type="text"
					onkeydown={handleKeydown}
				/>
				<Metadata>
					{$LL.editTitle()}
				</Metadata>
			</div>
		{:else}
			<a
				class="section-list-item__a"
				data-testid={isSession ? 'session-item' : 'knowledge-item'}
				aria-label={(isSession ? $LL.session() : $LL.knowledge()) + `: ${id}`}
				href={`/${sitemap}/${id}`}
			>
				<p class="section-list-item__title">
					{title}
				</p>
				<Metadata>
					{subtitle}
				</Metadata>
			</a>
		{/if}
		<nav
			class="section-list-item__actions"
			class:section-list-item__actions--confirm-deletion={isDeleting}
			class:section-list-item__actions--editing={isEditing}
		>
			{#if isSession && !isDeleting}
				<ButtonEdit
					bind:shouldConfirmEdit={isEditing}
					onConfirm={handleTitleEdit}
					onCancel={cancelEdit}
				/>
			{/if}
			{#if !isEditing}
				<ButtonDelete {sitemap} {id} bind:shouldConfirmDeletion={isDeleting} />
			{/if}
		</nav>
	</div>
{/key}

<style lang="postcss">
	.section-list-item {
		@apply flex flex-row items-center justify-between border-b pr-3;
		@apply last:border-b-0;

		&--confirm-deletion {
			@apply confirm-deletion;
		}

		&--editing {
			@apply confirm-editing;
		}
	}

	.section-list-item__content {
		@apply flex flex-1 flex-col px-6 py-3;
	}

	.section-list-item:hover .section-list-item__actions {
		@apply visible opacity-100;
	}

	.section-list-item__actions {
		@apply invisible flex flex-row items-center opacity-0;
	}

	.section-list-item__actions--confirm-deletion,
	.section-list-item__actions--editing {
		@apply visible opacity-100;
	}

	.section-list-item--active {
		@apply bg-shade-0;
	}

	.section-list-item__a {
		@apply relative z-0 w-full overflow-hidden text-ellipsis py-3 pl-5 pr-0;
		@apply hover:text-active;
	}

	.section-list-item__title {
		@apply max-w-full truncate whitespace-nowrap text-sm font-bold;
	}

	.section-list-item__title-input {
		@apply w-full bg-transparent text-sm font-bold;
		@apply focus:outline-none focus:ring-0;
	}
</style>
