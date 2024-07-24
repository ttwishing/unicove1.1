<script lang="ts">
    export let errorMessage: string | undefined;
</script>

{#if !!errorMessage}
    <div>
        <h3>
            {errorMessage}
        </h3>
    </div>
{/if}

<style lang="scss">
    div {
        padding: 10px 5px;

        h3 {
            color: var(--error-red);
        }
    }
</style>
