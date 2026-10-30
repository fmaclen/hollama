<script lang="ts">
	import EmptyMessage from '#lib/components/EmptyMessage.svelte';
	import Head from '#lib/components/Head.svelte';
	import { m } from '#lib/paraglide/messages.js';
</script>

<Head title={m.knowledge()} />
<EmptyMessage>{m.noKnowledgeChosen()}</EmptyMessage>
