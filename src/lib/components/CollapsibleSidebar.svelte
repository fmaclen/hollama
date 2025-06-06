<script lang="ts">
	import { page } from '$app/state';
	import { Brain, ChevronLeft, Github, MessageSquareText, Moon, NotebookText, Settings2, Sun } from 'lucide-svelte';
	import { onMount, type Snippet } from 'svelte';
	
	import LL from '$i18n/i18n-svelte';
	import { settingsStore } from '$lib/localStorage';
	import { updateStatusStore } from '$lib/updates';
	import { Sitemap } from '$lib/sitemap';
	import ButtonNew from './ButtonNew.svelte';
	import SectionList from './SectionList.svelte';

	interface Props {
		sessionsContent?: Snippet;
		knowledgeContent?: Snippet;
	}

	let { sessionsContent, knowledgeContent }: Props = $props();

	// Sidebar state management
	let isCollapsed = $state(false);
	let activeSection = $state<'sessions' | 'knowledge'>('sessions');

	// Derived values
	const pathname = $derived(page.url.pathname);
	
	// Determine active section based on current route
	$effect(() => {
		if (pathname.includes('/sessions')) {
			activeSection = 'sessions';
		} else if (pathname.includes('/knowledge')) {
			activeSection = 'knowledge';
		}
	});

	// Load collapse state from localStorage
	onMount(() => {
		const saved = localStorage.getItem('sidebar-collapsed');
		if (saved !== null) {
			isCollapsed = JSON.parse(saved);
		}
	});

	// Save collapse state to localStorage
	$effect(() => {
		localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
	});

	function toggleSidebar() {
		isCollapsed = !isCollapsed;
	}

	function toggleTheme() {
		$settingsStore.userTheme = $settingsStore.userTheme === 'light' ? 'dark' : 'light';
	}

	function setActiveSection(section: 'sessions' | 'knowledge') {
		activeSection = section;
		// Navigate to the section if not already there
		if (section === 'sessions' && !pathname.includes('/sessions')) {
			window.location.href = '/sessions';
		} else if (section === 'knowledge' && !pathname.includes('/knowledge')) {
			window.location.href = '/knowledge';
		}
	}
</script>

<aside 
	class="flex h-full flex-col bg-shade-1 border-r transition-all duration-300 ease-in-out {isCollapsed ? 'w-16' : 'w-80'}"
	data-testid="collapsible-sidebar"
>
	<!-- Header with logo and collapse toggle -->
	<div class="flex items-center justify-between p-4 border-b">
		{#if !isCollapsed}
			<a href="/" class="flex items-center gap-3">
				<img class="w-8 h-8" src="/favicon.png" alt="Hollama logo" />
				<span class="font-semibold text-lg">Hollama</span>
			</a>
		{:else}
			<a href="/" class="flex items-center justify-center w-full">
				<img class="w-8 h-8" src="/favicon.png" alt="Hollama logo" />
			</a>
		{/if}
		
		<button 
			onclick={toggleSidebar}
			class="p-1 rounded hover:bg-shade-2 transition-colors {isCollapsed ? 'rotate-180' : ''}"
			title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			<ChevronLeft class="w-4 h-4" />
		</button>
	</div>

	{#if !isCollapsed}
		<!-- Segmented Navigation -->
		<div class="p-4 border-b">
			<div class="flex bg-shade-2 rounded-lg p-1">
				<button
					onclick={() => setActiveSection('sessions')}
					class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors {activeSection === 'sessions' ? 'bg-shade-0 text-active shadow-sm' : 'text-muted hover:text-base'}"
				>
					<MessageSquareText class="w-4 h-4" />
					{$LL.sessions()}
				</button>
				<button
					onclick={() => setActiveSection('knowledge')}
					class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors {activeSection === 'knowledge' ? 'bg-shade-0 text-active shadow-sm' : 'text-muted hover:text-base'}"
				>
					<Brain class="w-4 h-4" />
					{$LL.knowledge()}
				</button>
			</div>
		</div>

		<!-- New Button and Content List -->
		<div class="flex-1 flex flex-col overflow-hidden">
			<div class="p-4 border-b">
				<ButtonNew sitemap={activeSection === 'sessions' ? Sitemap.SESSIONS : Sitemap.KNOWLEDGE} />
			</div>
			
			<div class="flex-1 overflow-auto">
				<SectionList>
					{#if activeSection === 'sessions'}
						{@render sessionsContent?.()}
					{:else if activeSection === 'knowledge'}
						{@render knowledgeContent?.()}
					{/if}
				</SectionList>
			</div>
		</div>

		<!-- Bottom Section -->
		<div class="border-t">
			<!-- MOTD -->
			<a
				href="/motd"
				class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted hover:text-active hover:bg-shade-2 transition-colors"
			>
				<NotebookText class="w-4 h-4" />
				{$LL.motd()}
			</a>

			<!-- Settings -->
			<a
				href="/settings"
				class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted hover:text-active hover:bg-shade-2 transition-colors relative {$updateStatusStore.showSidebarNotification ? 'before:absolute before:left-0 before:top-1/2 before:-translate-x-3 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-warning before:rounded-full' : ''}"
			>
				<Settings2 class="w-4 h-4" />
				{$LL.settings()}
			</a>

			<!-- GitHub -->
			<a
				href="https://github.com/fmaclen/hollama"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted hover:text-active hover:bg-shade-2 transition-colors"
			>
				<Github class="w-4 h-4" />
				GitHub
			</a>

			<!-- Theme Toggle -->
			<button
				onclick={toggleTheme}
				class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted hover:text-active hover:bg-shade-2 transition-colors w-full"
			>
				{#if $settingsStore.userTheme === 'light'}
					<Moon class="w-4 h-4" />
					{$LL.dark()}
				{:else}
					<Sun class="w-4 h-4" />
					{$LL.light()}
				{/if}
			</button>
		</div>
	{:else}
		<!-- Collapsed state - icon-only navigation -->
		<div class="flex flex-col items-center gap-2 p-2 flex-1">
			<!-- Sessions/Knowledge toggle -->
			<button
				onclick={() => setActiveSection('sessions')}
				class="p-3 rounded-lg hover:bg-shade-2 transition-colors {activeSection === 'sessions' ? 'bg-shade-2 text-active' : 'text-muted'}"
				title={$LL.sessions()}
			>
				<MessageSquareText class="w-5 h-5" />
			</button>
			
			<button
				onclick={() => setActiveSection('knowledge')}
				class="p-3 rounded-lg hover:bg-shade-2 transition-colors {activeSection === 'knowledge' ? 'bg-shade-2 text-active' : 'text-muted'}"
				title={$LL.knowledge()}
			>
				<Brain class="w-5 h-5" />
			</button>
		</div>

		<!-- Bottom icons -->
		<div class="flex flex-col items-center gap-2 p-2 border-t">
			<a
				href="/motd"
				class="p-3 rounded-lg hover:bg-shade-2 transition-colors text-muted"
				title={$LL.motd()}
			>
				<NotebookText class="w-5 h-5" />
			</a>
			
			<a
				href="/settings"
				class="p-3 rounded-lg hover:bg-shade-2 transition-colors text-muted relative {$updateStatusStore.showSidebarNotification ? 'before:absolute before:-top-1 before:-right-1 before:w-2 before:h-2 before:bg-warning before:rounded-full' : ''}"
				title={$LL.settings()}
			>
				<Settings2 class="w-5 h-5" />
			</a>
			
			<a
				href="https://github.com/fmaclen/hollama"
				target="_blank"
				rel="noopener noreferrer"
				class="p-3 rounded-lg hover:bg-shade-2 transition-colors text-muted"
				title="GitHub"
			>
				<Github class="w-5 h-5" />
			</a>
			
			<button
				onclick={toggleTheme}
				class="p-3 rounded-lg hover:bg-shade-2 transition-colors text-muted"
				title={$settingsStore.userTheme === 'light' ? $LL.dark() : $LL.light()}
			>
				{#if $settingsStore.userTheme === 'light'}
					<Moon class="w-5 h-5" />
				{:else}
					<Sun class="w-5 h-5" />
				{/if}
			</button>
		</div>
	{/if}
</aside>
