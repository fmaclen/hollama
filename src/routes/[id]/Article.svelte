<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import { Files } from 'lucide-svelte';

	import { type Message } from '$lib/sessions';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const md = new MarkdownIt();

	export let message: Message;

	function copyMessage() {
		navigator.clipboard.writeText(message.content);
	}
</script>

<article class="flex flex-col gap-y-3 max-w-[70ch] w-full mx-auto">
	<nav class="grid grid-cols-[max-content_auto_max-content] items-center">
		<p
			data-testid="session-role"
			class="
			mr-3
			text-center
			text-xs
			font-bold
			uppercase
			leading-7
			text-muted-foreground
		"
		>
			{message.role === 'user' ? 'You' : message.role}
		</p>
		<Separator />
		<Button
			class="opacity-25 hover:opacity-100"
			title="Copy message"
			variant="ghost"
			size="icon"
			on:click={copyMessage}
		>
			<Files class="h-4 w-4" />
		</Button>
	</nav>

	<div
		class="
		px-[3ch]
		mx-auto
		w-full
		text-md overflow-x-auto

		[&>p:not(:first-child,:last-child)]:my-4
		[&>p>code]:my-4
		[&>p>code]:rounded-md
		[&>p>code]:bg-gray-300
		[&>p>code]:p-1
		[&>p>code]:text-sm
		[&>p>code]:opacity-75
		
		[&>pre:not(:first-child,:last-child)>code]:my-4
		[&>pre>code]:block
		[&>pre>code]:overflow-y-auto
		[&>pre>code]:rounded-md
		[&>pre>code]:bg-gray-300
		[&>pre>code]:p-4
		[&>pre>code]:text-sm
		[&>pre>code]:opacity-75
		
		[&>ul]:flex
		[&>ul]:list-outside
		[&>ul]:list-disc
		[&>ul]:flex-col
		[&>ul]:gap-y-1
		[&>ul]:my-4
		[&>ul]:mx-8
	"
	>
		{#if message.content}
			{@html md.render(message.content)}
		{/if}
	</div>
</article>
