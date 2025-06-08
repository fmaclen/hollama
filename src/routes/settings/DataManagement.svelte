<script lang="ts">
	import { Download, FolderUp, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import {
		knowledgeStore,
		serversStore,
		sessionsStore,
		settingsStore,
		StorageKey
	} from '$lib/localStorage';
	import { DEFAULT_SETTINGS } from '$lib/settings';

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

		if (!confirm($LL.areYouSureYouWantToImportData())) {
			input.value = ''; // Reset the file input
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
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
				toast.success($LL.importSuccess());
			} catch (error) {
				console.error(error);
				toast.error($LL.importError(), {
					description: error instanceof Error ? error.message : 'Unknown error'
				});
			}
		};
		reader.readAsText(file);
	}

	function deleteData(storageKey: StorageKey) {
		let confirmDelete = '';

		switch (storageKey) {
			case StorageKey.HollamaPreferences:
				confirmDelete = $LL.areYouSureYouWantToDeleteAllPreferences();
				break;
			case StorageKey.HollamaServers:
				confirmDelete = $LL.areYouSureYouWantToDeleteAllServers();
				break;
			case StorageKey.HollamaSessions:
				confirmDelete = $LL.areYouSureYouWantToDeleteAllSessions();
				break;
			case StorageKey.HollamaKnowledge:
				confirmDelete = $LL.areYouSureYouWantToDeleteAllKnowledge();
				break;
		}

		if (confirm(confirmDelete)) {
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
			toast.info($LL.deleteSuccess());
		}
	}
</script>

<Fieldset>
	<P><strong>Data management</strong></P>
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
						<P><strong>{$LL.servers()}</strong></P>
						<span class="text-xs text-muted">{$LL.serversDescription()}</span>
					{:else if dataSource.storageKey === StorageKey.HollamaPreferences}
						<P><strong>{$LL.preferences()}</strong></P>
						<span class="text-xs text-muted">{$LL.preferencesDescription()}</span>
					{:else if dataSource.storageKey === StorageKey.HollamaSessions}
						<P><strong>{$LL.sessions()}</strong></P>
						<span class="text-xs text-muted">{$LL.sessionsDescription()}</span>
					{:else if dataSource.storageKey === StorageKey.HollamaKnowledge}
						<P><strong>{$LL.knowledge()}</strong></P>
						<span class="text-xs text-muted">{$LL.knowledgeDescription()}</span>
					{/if}
				</div>

				<nav class="mt-4 flex justify-between sm:mt-0">
					<Button
						variant="icon"
						onclick={() =>
							exportData(dataSource.storageKey, dataSource.fileName, dataSource.defaultValue)}
					>
						<Download class="base-icon" />
						{$LL.export()}
					</Button>
					<Button
						variant="icon"
						onclick={() =>
							document
								.getElementById(`import-${dataSource.storageKey.toLowerCase()}-input`)
								?.click()}
					>
						<FolderUp class="base-icon" />
						{$LL.import()}
					</Button>
					<Button variant="icon" onclick={() => deleteData(dataSource.storageKey)}>
						<Trash2 class="base-icon" />
						{$LL.delete()}
					</Button>
				</nav>
			</div>
		</div>
	{/each}
</Fieldset>
