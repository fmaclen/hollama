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
	<div class="settings-fieldsets">
		<Version />
		<Ollama />
		<Interface />
		<DangerZone />
	</div>
</section>

<style lang="postcss">
	.settings {
		@apply base-section base-section-fullscreen gap-y-8 px-6;
	}

	.settings-fieldsets {
		@apply my-auto flex flex-col gap-y-12;
	}
</style>
