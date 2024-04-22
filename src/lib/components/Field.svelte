<script lang="ts">
	export let name: string;
</script>

<label class="label" for={name}>
	<p class="title">
		<slot name="title"></slot>
	</p>
	<slot></slot>
</label>

<style lang="scss">
	.label {
		@apply flex flex-col gap-y-3;
	}

	.title {
		@apply flex items-center gap-x-2 text-sm font-medium leading-none;
	}
</style>
