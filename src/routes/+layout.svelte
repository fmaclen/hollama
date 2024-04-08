<script lang="ts">
	import '../app.pcss';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<div class="h-screen w-screen grid grid-cols-[240px,1fr]">
	<aside class="flex flex-col gap-y-4 p-4">
		<a href="/" class="flex items-center gap-x-2">
			<img src="/favicon.png" alt="Hollama logo" width="56" height="56" />
			<h1 class="font-medium">Hollama</h1>
		</a>

		<Button variant="outline" href={`/${Math.random().toString(36).substring(2, 8)}`}>
			New session
		</Button>
	</aside>

	<slot />
</div>
