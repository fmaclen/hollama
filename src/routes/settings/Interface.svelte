<script lang="ts">
	import FieldSelect from '#lib/components/FieldSelect.svelte';
	import Fieldset from '#lib/components/Fieldset.svelte';
	import P from '#lib/components/P.svelte';
	import { settingsStore } from '#lib/localStorage.js';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, type Locale } from '#lib/paraglide/runtime.js';

	let value: Locale = $state(getLocale());

	function changeLanguage() {
		if (!value) return;
		$settingsStore.userLanguage = value;
	}
</script>

<Fieldset>
	<P><strong>{m.interface()}</strong></P>

	<FieldSelect
		name="language"
		label={m.language()}
		bind:value
		allowClear={false}
		allowSearch={false}
		onChange={changeLanguage}
		options={[
			{ value: 'en', label: 'English' },
			{ value: 'ca', label: 'Català' },
			{ value: 'de', label: 'Deutsch' },
			{ value: 'zh-cn', label: '中文 (简体)' },
			{ value: 'es', label: 'Español' },
			{ value: 'fr', label: 'Français' },
			{ value: 'it', label: 'Italiano' },
			{ value: 'pt-br', label: 'Português (Brasil)' },
			{ value: 'ja', label: '日本語' },
			{ value: 'tr', label: 'Türkçe' },
			{ value: 'ka', label: 'ქართული' },
			{ value: 'vi', label: 'Tiếng Việt' }
		]}
	/>
</Fieldset>
