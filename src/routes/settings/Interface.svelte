<script lang="ts">
	import LL, { setLocale } from '$i18n/i18n-svelte';
	import type { Locales } from '$i18n/i18n-types';
	import { loadLocale } from '$i18n/i18n-util.sync';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { settingsStore } from '$lib/localStorage';

	let value: Locales = $state($settingsStore.userLanguage || 'en');

	$effect(() => {
		value = $settingsStore.userLanguage || 'en';
	});

	function changeLanguage() {
		if (!value) return;
		loadLocale(value);
		setLocale(value);
		$settingsStore.userLanguage = value;
	}
</script>

<Fieldset>
	<P><strong>{$LL.interface()}</strong></P>

	<FieldSelect
		name="language"
		label={$LL.language()}
		bind:value
		allowClear={false}
		allowSearch={false}
		onChange={changeLanguage}
		options={[
			{ value: 'en', label: 'English' },
			{ value: 'de', label: 'Deutsch' },
			{ value: 'zh-cn', label: '中文 (简体)' },
			{ value: 'es', label: 'Español' },
			{ value: 'fr', label: 'Français' },
			{ value: 'pt-br', label: 'Português (Brasil)' },
			{ value: 'ja', label: '日本語' },
			{ value: 'tr', label: 'Türkçe' },
			{ value: 'vi', label: 'Tiếng Việt' }
		]}
	/>
</Fieldset>
