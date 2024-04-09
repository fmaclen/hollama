<script lang="ts">
	import '../app.pcss';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
</script>

<div class="grid h-screen w-screen grid-cols-[240px,max-content,1fr] text-current">
	<aside class="flex flex-col">
		<a href="/" class="flex items-center gap-x-2 p-6">
			<img src="/favicon.png" alt="Hollama logo" width="56" height="56" />
			<h1 class="font-medium">Hollama</h1>
		</a>
		<Separator />
		<div class="p-6">
			<Button class="w-full" variant="outline" href={`/${Math.random().toString(36).substring(2, 8)}`}>
				New session
			</Button>
		</div>
	</aside>

	<Separator orientation="vertical" />

	<slot />
</div>
