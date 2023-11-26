<slot />

<style>
	:root {
		--font-family: 'SF Mono', monospace;
	}

	:global(*) {
		font-family: var(--font-family);
	}

	:global(body) {
		margin: unset;
	}
</style>
