<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import Head from '$lib/components/Head.svelte';

	import DangerZone from './DangerZone.svelte';
	import Interface from './Interface.svelte';
	import Ollama from './Ollama.svelte';
	import Version from './Version.svelte';
</script>

<Head title={$LL.settings()} />

<section class="settings">
		<Version />
		<Ollama />
		<Interface />
		<DangerZone />
</section>

<style lang="postcss">
	.settings {
		@apply base-section base-section-fullscreen;
	}
</style>
