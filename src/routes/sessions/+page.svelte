<script>
	import Empty from '$lib/components/EmptyMessage.svelte';
	import Head from '$lib/components/Head.svelte';
	import i18n from '$lib/i18n';
</script>

<Head title={$i18n.t('sessions', { count: 0 })} />
<Empty>{$i18n.t('sessionsPage.noSessionChosen')}</Empty>
