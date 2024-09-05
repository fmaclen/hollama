<script>
	import Empty from '$lib/components/EmptyMessage.svelte';
	import Head from '$lib/components/Head.svelte';
	import LL from '$i18n/i18n-svelte';
</script>

<Head title={$LL.sessions()} />
<Empty>{$LL.noSessionChosen()}</Empty>
