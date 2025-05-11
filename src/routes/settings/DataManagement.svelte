<script lang="ts">
	import { Download, FolderUp, Trash2 } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { StorageKey } from '$lib/localStorage';

	interface DataSource {
		label: string;
		storageKey: StorageKey;
		fileName: string;
		defaultValue: string;
		confirmDelete: string;
	}

	const dataSources: DataSource[] = [
		{
			label: 'Servers',
			storageKey: StorageKey.HollamaServers,
			fileName: 'hollama-servers.json',
			defaultValue: '[]',
			confirmDelete: 'Are you sure you want to delete all servers?'
		},
		{
			label: 'Preferences',
			storageKey: StorageKey.HollamaSettings,
			fileName: 'hollama-preferences.json',
			defaultValue: '{}',
			confirmDelete: 'Are you sure you want to delete all preferences?'
		},
		{
			label: 'Sessions',
			storageKey: StorageKey.HollamaSessions,
			fileName: 'hollama-sessions.json',
			defaultValue: '[]',
			confirmDelete: 'Are you sure you want to delete all sessions?'
		},
		{
			label: 'Knowledge',
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
				location.reload();
			} catch (err) {
				alert('Invalid file.');
			}
		};
		reader.readAsText(file);
	}

	function deleteData(storageKey: StorageKey, confirmDelete: string) {
		if (confirm(confirmDelete)) {
			localStorage.removeItem(storageKey);
			location.reload();
		}
	}
</script>

<Fieldset>
	<P><strong>Data management</strong></P>
	{#each dataSources as dataSource}
		<div
			class="flex flex-grow flex-col sm:flex-row gap-2"
			data-testid={`data-management-${dataSource.label.toLowerCase()}`}
		>
			<div
				class="inline-flex w-full flex-grow items-center gap-x-2 rounded-md border border-shade-4 p-2 text-sm leading-tight text-muted"
			>
				{dataSource.label}
			</div>
			<input
				id={`import-${dataSource.label.toLowerCase()}-input`}
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
					document.getElementById(`import-${dataSource.label.toLowerCase()}-input`)?.click()}
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
