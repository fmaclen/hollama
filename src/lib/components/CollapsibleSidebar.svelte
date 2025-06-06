<script lang="ts">
	import {
		Brain,
		Github,
		MessageSquareText,
		Moon,
		NotebookText,
		Settings2,
		Sun
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	import LL from '$i18n/i18n-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { knowledgeStore, sessionsStore, settingsStore } from '$lib/localStorage';
	import { formatSessionMetadata, getSessionTitle } from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';
	import { updateStatusStore } from '$lib/updates';
	import { formatTimestampToNow } from '$lib/utils';

	import ButtonNew from './ButtonNew.svelte';
	import EmptyMessage from './EmptyMessage.svelte';
	import SectionList from './SectionList.svelte';
	import SectionListItem from './SectionListItem.svelte';
	import SidebarToggle from './SidebarToggle.svelte';

	let activeSection = $state<'sessions' | 'knowledge'>('sessions');

	const pathname = $derived(page.url.pathname);

	$effect(() => {
		if (pathname.includes('/sessions')) {
			activeSection = 'sessions';
		} else if (pathname.includes('/knowledge')) {
			activeSection = 'knowledge';
		}
	});

	function toggleTheme() {
		$settingsStore.userTheme = $settingsStore.userTheme === 'light' ? 'dark' : 'light';
	}

	function setActiveSection(section: 'sessions' | 'knowledge') {
		activeSection = section;
		if (section === 'sessions' && !pathname.includes('/sessions')) {
			goto('/sessions');
		} else if (section === 'knowledge' && !pathname.includes('/knowledge')) {
			goto('/knowledge');
		}
	}
</script>

{#if $settingsStore.sidebarExpanded}
	<div
		class="absolute inset-0 bg-neutral-900/50 lg:relative lg:bg-transparent"
		transition:fade={{ duration: 100 }}
	>
		<aside
			class="
		flex h-full w-[90vw] flex-shrink-0 flex-col bg-shade-1 lg:mr-4 lg:w-80 lg:rounded-xl lg:border
	"
			transition:slide={{ delay: 50, duration: 100, axis: 'x' }}
		>
			<div class="flex items-center justify-between border-b p-4">
				<a href="/" class="flex items-center gap-3">
					<img class="h-8 w-8" src="/favicon.png" alt="Hollama logo" />
					<span class="text-lg font-semibold tracking-tight">Hollama</span>
				</a>

				<SidebarToggle class="lg:hidden" />
			</div>

			<div class="flex bg-shade-2 px-3 py-2 text-xs">
				<button
					onclick={() => setActiveSection('sessions')}
					class="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 font-medium {activeSection ===
					'sessions'
						? 'bg-shade-0 text-active shadow-sm'
						: 'text-muted'}"
				>
					<MessageSquareText class="h-4 w-4" />
					{$LL.sessions()}
				</button>
				<button
					onclick={() => setActiveSection('knowledge')}
					class="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 font-medium {activeSection ===
					'knowledge'
						? 'bg-shade-0 text-active shadow-sm'
						: 'text-muted'}"
				>
					<Brain class="h-4 w-4" />
					{$LL.knowledge()}
				</button>
			</div>
			<div class="px-3 pb-3 pt-5">
				<ButtonNew sitemap={activeSection === 'sessions' ? Sitemap.SESSIONS : Sitemap.KNOWLEDGE} />
			</div>

			<div class="flex flex-1 flex-col overflow-hidden">
				<div class="flex-1 overflow-auto">
					<SectionList>
						{#if activeSection === 'sessions'}
							{#if $sessionsStore && $sessionsStore.length > 0}
								{#each $sessionsStore as session (session.id)}
									<SectionListItem
										sitemap={Sitemap.SESSIONS}
										id={session.id}
										title={getSessionTitle(session)}
										subtitle={formatSessionMetadata(session)}
									/>
								{/each}
							{:else}
								<EmptyMessage>{$LL.emptySessions()}</EmptyMessage>
							{/if}
						{:else if activeSection === 'knowledge'}
							{#if $knowledgeStore && $knowledgeStore.length > 0}
								{#each $knowledgeStore as knowledge (knowledge.id)}
									<SectionListItem
										sitemap={Sitemap.KNOWLEDGE}
										id={knowledge.id}
										title={knowledge.name}
										subtitle={formatTimestampToNow(knowledge.updatedAt)}
									/>
								{/each}
							{:else}
								<EmptyMessage>{$LL.emptyKnowledge()}</EmptyMessage>
							{/if}
						{/if}
					</SectionList>
				</div>
			</div>

			<div class="border-t px-2 py-3">
				<a href="/motd" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted">
					<NotebookText class="h-4 w-4" />
					{$LL.motd()}
				</a>

				<a
					href="/settings"
					class="relative flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted {$updateStatusStore.showSidebarNotification
						? 'before:absolute before:left-0 before:top-1/2 before:h-2 before:w-2 before:-translate-x-3 before:-translate-y-1/2 before:rounded-full before:bg-warning'
						: ''}"
				>
					<Settings2 class="h-4 w-4" />
					{$LL.settings()}
				</a>

				<a
					href="https://github.com/fmaclen/hollama"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted"
				>
					<Github class="h-4 w-4" />
					GitHub
				</a>

				<button
					onclick={toggleTheme}
					class="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-muted"
				>
					{#if $settingsStore.userTheme === 'light'}
						<Moon class="h-4 w-4" />
						{$LL.dark()}
					{:else}
						<Sun class="h-4 w-4" />
						{$LL.light()}
					{/if}
				</button>
			</div>
		</aside>
	</div>
{/if}
