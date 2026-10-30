<script lang="ts">
	import { Download, FolderUp, Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	import Button from '#lib/components/Button.svelte';
	import Fieldset from '#lib/components/Fieldset.svelte';
	import P from '#lib/components/P.svelte';
	import {
		knowledgeStore,
		serversStore,
		sessionsStore,
		settingsStore,
		StorageKey
	} from '#lib/localStorage.js';
	import { m } from '#lib/paraglide/messages.js';
	import { DEFAULT_SETTINGS } from '#lib/settings.js';

	interface DataSource {
		storageKey: StorageKey;
		fileName: string;
		defaultValue: string;
	}

	const dataSources: DataSource[] = [
		{
			storageKey: StorageKey.HollamaServers,
			fileName: `hollama-servers.json`,
			defaultValue: '[]'
		},
		{
			storageKey: StorageKey.HollamaPreferences,
			fileName: `hollama-preferences.json`,
			defaultValue: '{}'
		},
		{
			storageKey: StorageKey.HollamaSessions,
			fileName: `hollama-sessions.json`,
			defaultValue: '[]'
		},
		{
			storageKey: StorageKey.HollamaKnowledge,
			fileName: `hollama-knowledge.json`,
			defaultValue: '[]'
		}
	];

	function exportData(storageKey: StorageKey, fileName: string, defaultValue: string) {
		const data = localStorage.getItem(storageKey) || defaultValue;
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function importData(event: Event, storageKey: StorageKey) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		const file = input.files[0];

		if (!confirm(m.areYouSureYouWantToImportData())) {
			input.value = ''; // Reset the file input
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			// Imported preferences can switch the language, so word the toast in the current one
			const importSuccess = m.importSuccess();
			try {
				const data = JSON.parse(e.target?.result as string);
				localStorage.setItem(storageKey, JSON.stringify(data));
				switch (storageKey) {
					case StorageKey.HollamaPreferences:
						$settingsStore = data;
						break;
					case StorageKey.HollamaServers:
						$serversStore = data;
						break;
					case StorageKey.HollamaSessions:
						$sessionsStore = data;
						break;
					case StorageKey.HollamaKnowledge:
						$knowledgeStore = data;
						break;
				}
				toast.success(importSuccess);
			} catch (error) {
				console.error(error);
				toast.error(m.importError(), {
					description: error instanceof Error ? error.message : m.unknownError()
				});
			}
		};
		reader.readAsText(file);
	}

	function deleteData(storageKey: StorageKey) {
		let confirmDelete = '';

		switch (storageKey) {
			case StorageKey.HollamaPreferences:
				confirmDelete = m.areYouSureYouWantToDeleteAllPreferences();
				break;
			case StorageKey.HollamaServers:
				confirmDelete = m.areYouSureYouWantToDeleteAllServers();
				break;
			case StorageKey.HollamaSessions:
				confirmDelete = m.areYouSureYouWantToDeleteAllSessions();
				break;
			case StorageKey.HollamaKnowledge:
				confirmDelete = m.areYouSureYouWantToDeleteAllKnowledge();
				break;
		}

		if (confirm(confirmDelete)) {
			// Deleting preferences resets the language, so word the toast in the current one
			const deleteSuccess = m.deleteSuccess();
			localStorage.removeItem(storageKey);
			switch (storageKey) {
				case StorageKey.HollamaPreferences:
					$settingsStore = DEFAULT_SETTINGS;
					break;
				case StorageKey.HollamaServers:
					$serversStore = [];
					break;
				case StorageKey.HollamaSessions:
					$sessionsStore = [];
					break;
				case StorageKey.HollamaKnowledge:
					$knowledgeStore = [];
					break;
			}
			toast.info(deleteSuccess);
		}
	}
</script>

<Fieldset>
	<P><strong>{m.dataManagement()}</strong></P>
	{#each dataSources as dataSource (dataSource.storageKey)}
		<div
			class="flex flex-grow flex-col gap-2 sm:flex-row"
			data-testid={`data-management-${dataSource.storageKey}`}
		>
			<input
				id={`import-${dataSource.storageKey}-input`}
				type="file"
				accept="application/json"
				style="display: none;"
				onchange={(e) => importData(e, dataSource.storageKey)}
			/>
			<div
				class="inline-flex w-full flex-grow flex-col justify-between gap-x-2 text-balance rounded-md border border-shade-4 p-2 text-sm leading-tight sm:flex-row sm:items-center"
			>
				<div class="flex flex-col">
					<!-- HACK: because the labels are reactive we need to define them here -->
					{#if dataSource.storageKey === StorageKey.HollamaServers}
						<P><strong>{m.servers()}</strong></P>
						<span class="text-xs text-muted">{m.serversDescription()}</span>
					{:else if dataSource.storageKey === StorageKey.HollamaPreferences}
						<P><strong>{m.preferences()}</strong></P>
						<span class="text-xs text-muted">{m.preferencesDescription()}</span>
					{:else if dataSource.storageKey === StorageKey.HollamaSessions}
						<P><strong>{m.sessions()}</strong></P>
						<span class="text-xs text-muted">{m.sessionsDescription()}</span>
					{:else if dataSource.storageKey === StorageKey.HollamaKnowledge}
						<P><strong>{m.knowledge()}</strong></P>
						<span class="text-xs text-muted">{m.knowledgeDescription()}</span>
					{/if}
				</div>

				<nav class="mt-4 flex justify-between sm:mt-0">
					<Button
						variant="icon"
						onclick={() =>
							exportData(dataSource.storageKey, dataSource.fileName, dataSource.defaultValue)}
					>
						<Download class="base-icon" />
						{m.export()}
					</Button>
					<Button
						variant="icon"
						onclick={() =>
							document
								.getElementById(`import-${dataSource.storageKey.toLowerCase()}-input`)
								?.click()}
					>
						<FolderUp class="base-icon" />
						{m.import()}
					</Button>
					<Button variant="icon" onclick={() => deleteData(dataSource.storageKey)}>
						<Trash2 class="base-icon" />
						{m.delete()}
					</Button>
				</nav>
			</div>
		</div>
	{/each}
</Fieldset>
