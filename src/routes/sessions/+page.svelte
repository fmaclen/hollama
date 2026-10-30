<script>
	import Empty from '#lib/components/EmptyMessage.svelte';
	import Head from '#lib/components/Head.svelte';
	import { m } from '#lib/paraglide/messages.js';
</script>

<Head title={m.sessions()} />
<Empty>{m.noSessionChosen()}</Empty>
