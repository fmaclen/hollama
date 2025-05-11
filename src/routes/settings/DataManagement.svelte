<script lang="ts">
import Button from '$lib/components/Button.svelte';
import Fieldset from '$lib/components/Fieldset.svelte';
import P from '$lib/components/P.svelte';
import { StorageKey } from '$lib/localStorage';

// Sessions import/export/delete logic
function exportSessions() {
	const data = localStorage.getItem(StorageKey.HollamaSessions) || '[]';
	const blob = new Blob([data], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'hollama-sessions.json';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function importSessions(event: Event) {
	const input = event.target as HTMLInputElement;
	if (!input.files || input.files.length === 0) return;
	const file = input.files[0];
	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const data = JSON.parse(e.target?.result as string);
			localStorage.setItem(StorageKey.HollamaSessions, JSON.stringify(data));
			location.reload();
		} catch (err) {
			alert('Invalid sessions file.');
		}
	};
	reader.readAsText(file);
}

function deleteSessions() {
	if (confirm('Are you sure you want to delete all sessions?')) {
		localStorage.removeItem(StorageKey.HollamaSessions);
		location.reload();
	}
}

// Knowledge import/export/delete logic
function exportKnowledge() {
	const data = localStorage.getItem(StorageKey.HollamaKnowledge) || '[]';
	const blob = new Blob([data], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'hollama-knowledge.json';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function importKnowledge(event: Event) {
	const input = event.target as HTMLInputElement;
	if (!input.files || input.files.length === 0) return;
	const file = input.files[0];
	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const data = JSON.parse(e.target?.result as string);
			localStorage.setItem(StorageKey.HollamaKnowledge, JSON.stringify(data));
			location.reload();
		} catch (err) {
			alert('Invalid knowledge file.');
		}
	};
	reader.readAsText(file);
}

function deleteKnowledge() {
	if (confirm('Are you sure you want to delete all knowledge?')) {
		localStorage.removeItem(StorageKey.HollamaKnowledge);
		location.reload();
	}
}

// Settings import/export/delete logic
function exportSettings() {
	const data = localStorage.getItem(StorageKey.HollamaSettings) || '{}';
	const blob = new Blob([data], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'hollama-settings.json';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function importSettings(event: Event) {
	const input = event.target as HTMLInputElement;
	if (!input.files || input.files.length === 0) return;
	const file = input.files[0];
	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const data = JSON.parse(e.target?.result as string);
			localStorage.setItem(StorageKey.HollamaSettings, JSON.stringify(data));
			location.reload();
		} catch (err) {
			alert('Invalid settings file.');
		}
	};
	reader.readAsText(file);
}

function deleteSettings() {
	if (confirm('Are you sure you want to delete all settings?')) {
		localStorage.removeItem(StorageKey.HollamaSettings);
		localStorage.removeItem(StorageKey.HollamaServers);
		location.reload();
	}
}
</script>

<Fieldset>
	<P><strong>Data Management</strong></P>

	<div class="data-management">
		<P><strong>Sessions</strong></P>
		<div style="display: flex; gap: 0.5rem; align-items: center;">
			<Button variant="outline" on:click={exportSessions}>Export</Button>
			<Button variant="outline" on:click={() => document.getElementById('import-sessions-input')?.click()}>Import</Button>
			<input id="import-sessions-input" type="file" accept="application/json" style="display: none;" on:change={importSessions} />
			<Button variant="outline" on:click={deleteSessions}>Delete</Button>
		</div>
	</div>
	<div class="data-management">
		<P><strong>Knowledge</strong></P>
		<div style="display: flex; gap: 0.5rem; align-items: center;">
			<Button variant="outline" on:click={exportKnowledge}>Export</Button>
			<Button variant="outline" on:click={() => document.getElementById('import-knowledge-input')?.click()}>Import</Button>
			<input id="import-knowledge-input" type="file" accept="application/json" style="display: none;" on:change={importKnowledge} />
			<Button variant="outline" on:click={deleteKnowledge}>Delete</Button>
		</div>
	</div>
	<div class="data-management">
		<P><strong>Settings</strong></P>
		<div style="display: flex; gap: 0.5rem; align-items: center;">
			<Button variant="outline" on:click={exportSettings}>Export</Button>
			<Button variant="outline" on:click={() => document.getElementById('import-settings-input')?.click()}>Import</Button>
			<input id="import-settings-input" type="file" accept="application/json" style="display: none;" on:change={importSettings} />
			<Button variant="outline" on:click={deleteSettings}>Delete</Button>
		</div>
	</div>
</Fieldset> 
