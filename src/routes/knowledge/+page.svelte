<script lang="ts">
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import Head from '$lib/components/Head.svelte';
	import i18n from '$lib/i18n';
</script>

<Head title={$i18n.t('knowledge.pageTitle')} />
<EmptyMessage>{$i18n.t('knowledge.noKnowledgeChosen')}</EmptyMessage>
