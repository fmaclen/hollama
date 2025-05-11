<script lang="ts">
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
	<P><strong>Data Management</strong></P>
	{#each dataSources as ds}
		{#snippet legend()}
			<P>{ds.label}</P>
		{/snippet}
		<Fieldset legend={legend}>
			<div style="display: flex; gap: 0.5rem; align-items: center;">
				<Button variant="outline" on:click={() => exportData(ds.storageKey, ds.fileName, ds.defaultValue)}>Export</Button>
				<Button variant="outline" on:click={() => document.getElementById(`import-${ds.label.toLowerCase()}-input`)?.click()}>Import</Button>
				<input id={`import-${ds.label.toLowerCase()}-input`} type="file" accept="application/json" style="display: none;" on:change={(e) => importData(e, ds.storageKey)} />
				<Button variant="outline" on:click={() => deleteData(ds.storageKey, ds.confirmDelete)}>Delete</Button>
			</div>
		</Fieldset>
	{/each}
</Fieldset> 
