<script lang="ts">
	import Head from '#lib/components/Head.svelte';
	import { m } from '#lib/paraglide/messages.js';

	import DataManagement from './DataManagement.svelte';
	import Interface from './Interface.svelte';
	import Servers from './Servers.svelte';
	import Version from './Version.svelte';
</script>

<Head title={m.settings()} />

<section class="settings">
	<div class="settings-fieldsets">
		<Version />
		<Servers />
		<Interface />
		<DataManagement />
	</div>
</section>

<style lang="postcss">
	.settings {
		@apply base-section base-section-fullscreen gap-y-8 px-4;
	}

	.settings-fieldsets {
		@apply my-auto flex w-full flex-col gap-y-12;
	}
</style>
