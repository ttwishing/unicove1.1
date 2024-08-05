<script lang="ts">
    import { currentAccount } from "$lib/wharfkit/store";

    import FormTransaction from "$lib/components/elements/form/transaction.svelte";
    import RAMBuy from "~/pages/resources/components/forms/rambuy.svelte";
    import ResourceStateRAM from "~/pages/resources/components/state/ram.svelte";
</script>

<div class="wrapper">
    <ResourceStateRAM />
    {#if $currentAccount}
        <div class="form">
            <FormTransaction>
                <RAMBuy />
            </FormTransaction>
        </div>
    {/if}
</div>

<style type="scss">
    .form,
    .wrapper {
        margin: 16px 0;
    }
    @media only screen and (max-width: 999px) {
        .wrapper {
            margin: 16px;
        }
    }
</style>
