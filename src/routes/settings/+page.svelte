<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import Head from '$lib/components/Head.svelte';

	import DangerZone from './DangerZone.svelte';
	import Language from './Language.svelte';
	import Ollama from './Ollama.svelte';
	import Version from './Version.svelte';
</script>

<Head title={$LL.settings()} />

<section class="settings">
	<div class="settings__container">
		<Language />
		<Version />
		<Ollama />
		<DangerZone />
	</div>
</section>

<style lang="postcss">
	.settings {
		@apply base-section;
		@apply flex border-spacing-1 flex-col bg-shade-1;
	}

	.settings__container {
		@apply my-auto flex flex-col gap-y-4;
	}
</style>
