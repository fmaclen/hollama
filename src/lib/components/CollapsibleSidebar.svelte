<script lang="ts">
	import { Brain, MessageSquareText, Moon, NotebookText, Settings2, Sun } from '@lucide/svelte';
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

	type SidebarSection = 'sessions' | 'knowledge';

	let activeSection: SidebarSection = $state('sessions');

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

	function setActiveSection(section: SidebarSection) {
		activeSection = section;
		if (section === 'sessions') {
			goto('/sessions');
		} else if (section === 'knowledge') {
			goto('/knowledge');
		}
	}
</script>

{#if $settingsStore.sidebarExpanded}
	<div
		class="absolute inset-0 z-20 bg-neutral-900/50 lg:relative lg:bg-transparent"
		transition:fade={{ duration: 100 }}
	>
		<nav
			class="
		flex h-full w-[90vw] flex-shrink-0 flex-col bg-shade-1 lg:mr-4 lg:w-96 lg:rounded-xl lg:border
	"
			transition:slide={{ delay: 50, duration: 100, axis: 'x' }}
			aria-label="Main navigation"
			data-testid="sidebar"
		>
			<div class="flex items-center justify-between border-b py-4">
				<a href="/" class="mx-auto flex items-center gap-2 pr-4">
					<img class="h-8 w-8" src="/favicon.png" alt="Hollama logo" />
					<span class="text-lg font-semibold tracking-tight">Hollama</span>
				</a>
			</div>

			<div class="flex bg-shade-2 px-3 py-2 text-sm" role="tablist" aria-label="Content sections">
				<button
					onclick={() => setActiveSection('sessions')}
					class="duration-25 flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 font-medium transition-colors hover:text-active {activeSection ===
						'sessions' && pathname.includes('/sessions')
						? 'bg-shade-0 text-active shadow-sm'
						: activeSection === 'sessions' && !pathname.includes('/sessions')
							? 'bg-shade-1 text-muted shadow-sm'
							: 'text-muted'}"
					role="tab"
					aria-selected={activeSection === 'sessions'}
					aria-controls="sessions-panel"
				>
					<MessageSquareText class="h-4 w-4" />
					{$LL.sessions()}
				</button>
				<button
					onclick={() => setActiveSection('knowledge')}
					class="duration-25 flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 font-medium transition-colors hover:text-active {activeSection ===
					'knowledge'
						? 'bg-shade-0 text-active shadow-sm'
						: 'text-muted'}"
					role="tab"
					aria-selected={activeSection === 'knowledge'}
					aria-controls="knowledge-panel"
				>
					<Brain class="h-4 w-4" />
					{$LL.knowledge()}
				</button>
			</div>
			<div class="border-b bg-shade-2 px-3 pb-3 pt-0">
				<ButtonNew sitemap={activeSection === 'sessions' ? Sitemap.SESSIONS : Sitemap.KNOWLEDGE} />
			</div>

			<div class="flex flex-1 flex-col overflow-hidden">
				<div class="flex-1 overflow-auto">
					<section
						class="h-full"
						id="sessions-panel"
						aria-labelledby="sessions-tab"
						hidden={activeSection !== 'sessions'}
					>
						{#if activeSection === 'sessions'}
							<SectionList>
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
							</SectionList>
						{/if}
					</section>
					<section
						id="knowledge-panel"
						class="h-full"
						aria-labelledby="knowledge-tab"
						hidden={activeSection !== 'knowledge'}
					>
						{#if activeSection === 'knowledge'}
							<SectionList>
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
							</SectionList>
						{/if}
					</section>
				</div>
			</div>

			<div class="border-t px-2 py-3">
				<a
					href="/motd"
					class="duration-25 flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:text-active {pathname.includes(
						'/motd'
					)
						? 'text-active'
						: 'text-muted'}"
					aria-current={pathname.includes('/motd') ? 'page' : undefined}
				>
					<NotebookText class="h-4 w-4" />
					{$LL.motd()}
				</a>

				<a
					href="/settings"
					class="duration-25 relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:text-active {pathname.includes(
						'/settings'
					)
						? 'text-active'
						: 'text-muted'} {$updateStatusStore.showSidebarNotification
						? 'before:absolute before:left-0 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-warning'
						: ''}"
					aria-current={pathname.includes('/settings') ? 'page' : undefined}
				>
					<Settings2 class="h-4 w-4" />
					{$LL.settings()}
				</a>

				<a
					href="https://github.com/fmaclen/hollama"
					target="_blank"
					rel="noopener noreferrer"
					class="duration-25 flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted transition-colors hover:text-active"
				>
					<!-- Lucide no longer ships brand icons, so this is GitHub's own mark -->
					<svg class="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
						<path
							d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
						/>
					</svg>
					GitHub
				</a>

				<button
					onclick={toggleTheme}
					class="duration-25 flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-muted transition-colors hover:text-active"
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
		</nav>
	</div>
{/if}
