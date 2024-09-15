<script lang="ts">
	export let context: 'editor' | 'settings' | undefined = undefined;
</script>

<fieldset class="fieldset {context ? `fieldset--${context}` : ''}">
	<slot />
</fieldset>

<style lang="postcss">
	.fieldset {
		@apply container mx-auto flex max-w-[80ch] flex-col gap-y-3 p-6;

		&--editor {
			@apply h-full overflow-hidden;
		}

		&--settings {
			@apply p-0;
		}
	}
</style>
