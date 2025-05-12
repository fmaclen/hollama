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
		confirmDelete: string;
	}

	const dataSources: DataSource[] = [
		{
			storageKey: StorageKey.HollamaServers,
			fileName: 'hollama-servers.json',
			defaultValue: '[]',
			confirmDelete: 'Are you sure you want to delete all servers?'
		},
		{
			storageKey: StorageKey.HollamaSettings,
			fileName: 'hollama-preferences.json',
			defaultValue: '{}',
			confirmDelete: 'Are you sure you want to delete all preferences?'
		},
		{
			storageKey: StorageKey.HollamaSessions,
			fileName: 'hollama-sessions.json',
			defaultValue: '[]',
			confirmDelete: 'Are you sure you want to delete all sessions?'
		},
		{
			storageKey: StorageKey.HollamaKnowledge,
			fileName: 'hollama-knowledge.json',
			defaultValue: '[]',
			confirmDelete: 'Are you sure you want to delete all knowledge?'
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
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = JSON.parse(e.target?.result as string);
				localStorage.setItem(storageKey, JSON.stringify(data));
				switch (storageKey) {
					case StorageKey.HollamaSettings:
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

	function deleteData(storageKey: StorageKey, confirmDelete: string) {
		if (confirm(confirmDelete)) {
			localStorage.removeItem(storageKey);
			switch (storageKey) {
				case StorageKey.HollamaSettings:
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
			<div
				class="inline-flex w-full flex-grow items-center gap-x-2 rounded-md border border-shade-4 p-2 text-sm leading-tight text-muted"
			>
				<!-- HACK: because the labels are reactive we need to define them here -->
				{#if dataSource.storageKey === StorageKey.HollamaServers}
					{$LL.servers()}
				{:else if dataSource.storageKey === StorageKey.HollamaSettings}
					{$LL.preferences()}
				{:else if dataSource.storageKey === StorageKey.HollamaSessions}
					{$LL.sessions()}
				{:else if dataSource.storageKey === StorageKey.HollamaKnowledge}
					{$LL.knowledge()}
				{/if}
			</div>
			<input
				id={`import-${dataSource.storageKey}-input`}
				type="file"
				accept="application/json"
				style="display: none;"
				onchange={(e) => importData(e, dataSource.storageKey)}
			/>

			<Button
				variant="outline"
				onclick={() =>
					exportData(dataSource.storageKey, dataSource.fileName, dataSource.defaultValue)}
			>
				<Download class="base-icon" />
				{$LL.export()}
			</Button>
			<Button
				variant="outline"
				onclick={() =>
					document.getElementById(`import-${dataSource.storageKey.toLowerCase()}-input`)?.click()}
			>
				<FolderUp class="base-icon" />
				{$LL.import()}
			</Button>
			<Button
				variant="outline"
				onclick={() => deleteData(dataSource.storageKey, dataSource.confirmDelete)}
			>
				<Trash2 class="base-icon" />
				{$LL.delete()}
			</Button>
		</div>
	{/each}
</Fieldset>
