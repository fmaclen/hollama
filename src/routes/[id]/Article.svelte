<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import { type Message } from '$lib/sessions';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Files } from 'lucide-svelte';

	const md = new MarkdownIt();

	export let message: Message;

	function copyMessage() {
		navigator.clipboard.writeText(message.content);
	}
</script>

<article class="flex flex-col gap-y-3 max-w-[60ch] mx-auto">
	<nav class="grid grid-cols-[max-content_auto_max-content] items-center">
		<p data-testid="session-role" class="
			text-xs
			text-muted-foreground
			text-center
			font-bold
			leading-7
			uppercase
			mr-3
		">
			{message.role === 'user' ? 'You' : message.role}
		</p>
		<Separator />
		<Button
			class="opacity-25 hover:opacity-100"
			title="Delete session"
			variant="ghost"
			size="icon"
			on:click={copyMessage}
		>
			<Files class="h-4 w-4" />
		</Button>
	</nav>

	<div class="
		overflow-x-auto text-md

		[&>pre>code]:block
		[&>pre>code]:opacity-75
		[&>pre>code]:overflow-y-auto
		[&>pre>code]:bg-gray-300
		[&>pre>code]:rounded-md
		[&>pre>code]:text-sm
		[&>pre>code]:p-4
		[&>pre:not(:first-child,:last-child)>code]:my-4
		
		[&>p]:max-w-[60ch]
		[&>p:not(:first-child,:last-child)]:my-4
		[&>ul]:max-w-[60ch]
		[&>ul]:my-4
		[&>ul]:flex
		[&>ul]:flex-col
		[&>ul]:gap-y-1
		[&>ul]:list-inside
		[&>ul]:list-disc

		[&>p>code]:opacity-75
		[&>p>code]:bg-gray-300
		[&>p>code]:rounded-md
		[&>p>code]:text-sm
		[&>p>code]:p-1
		[&>p>code]:my-4
	">
		{#if message.content}
			{@html md.render(message.content)}
		{/if}
	</div>
</article>

