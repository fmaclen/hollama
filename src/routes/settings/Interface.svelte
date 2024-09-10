<script lang="ts">
	import LL, { setLocale } from '$i18n/i18n-svelte';
	import type { Locales } from '$i18n/i18n-types';
	import { loadLocale } from '$i18n/i18n-util.sync';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { settingsStore } from '$lib/localStorage';

	let value: Locales;
	$: if (value) changeLanguage(value);

	function changeLanguage(locale: Locales) {
		if (!locale) return;
		loadLocale(locale);
		setLocale(locale);
		$settingsStore.userLanguage = locale;
	}
</script>

<Fieldset>
	<P><strong>{$LL.interface()}</strong></P>

	<FieldSelect
		name="language"
		label={$LL.language()}
		bind:value
		options={[
			{ value: 'en', option: 'English' },
			{ value: 'es', option: 'Español' }
		]}
	/>
</Fieldset>
