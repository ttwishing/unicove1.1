<script lang="ts">
    import Container from "./container.svelte";
    import StatusChange from "./change.svelte";

    export let header: string;
    export let subheader: string | undefined = undefined;
    export let changeStep: (() => void) | undefined = undefined;
</script>

<Container>
    <div class="label">
        <h3>{header}</h3>
        {#if subheader}
            <p>{subheader}</p>
        {/if}
    </div>

    <div class="value">
        <slot />
    </div>
    {#if changeStep}
        <StatusChange {changeStep} />
    {/if}
</Container>

<style lang="scss">
    .label {
        h3 {
            display: block;
            font-weight: bold;
        }
    }

    .value {
        flex: 1;
        text-align: right;
    }
</style>
