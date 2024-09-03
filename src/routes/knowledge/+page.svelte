<script lang="ts">
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import Head from '$lib/components/Head.svelte';
	import i18n from '$lib/i18n';
</script>

<Head title={$i18n.t('knowledge', { count: 0 })} />
<EmptyMessage>{$i18n.t('noKnowledgeChosen')}</EmptyMessage>
