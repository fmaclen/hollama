<script lang="ts">
	import LL, { setLocale } from '$i18n/i18n-svelte';
	import type { Locales } from '$i18n/i18n-types';
	import { loadLocale } from '$i18n/i18n-util.sync';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { settingsStore } from '$lib/localStorage';

	let value: Locales = $settingsStore.userLanguage || 'en';

	function changeLanguage(locale: Locales) {
		if (!locale) return;
		loadLocale(locale);
		setLocale(locale);
		$settingsStore.userLanguage = locale;
	}
</script>

<Fieldset context="settings">
	<P><strong>{$LL.interface()}</strong></P>

	<FieldSelect
		name="language"
		label={$LL.language()}
		bind:value
		allowClear={false}
		allowSearch={false}
		onChange={() => changeLanguage(value)}
		options={[
			{ value: 'en', label: 'English' },
			{ value: 'es', label: 'Español' },
			{ value: 'tr', label: 'Türkçe' }
		]}
	/>
</Fieldset>
