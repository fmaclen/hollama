<script lang="ts">
	import { version } from '$app/environment';

	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
</script>

<Fieldset>
	<P>
		<strong>Version</strong>
		<Button variant="icon" href="https://github.com/fmaclen/hollama/releases" target="_blank">
			<Badge>{version}</Badge>
		</Button>
	</P>
</Fieldset>
