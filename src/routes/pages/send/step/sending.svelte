<script lang="ts">
    import { activeBlockchain } from "$lib/app/store";
    import { transferData } from "../transfer";
    import type { Token } from "$lib/stores/tokens";

    import { txFee } from "../fio";

    import StatusAddress from "../status/address.svelte";
    import StatusAccount from "../status/account.svelte";
    import StatusQuantity from "../status/quantity.svelte";
    import StatusMemo from "../status/memo.svelte";
    import StatusFee from "../status/fee.svelte";

    export let token: Token;
</script>

<div class="container">
    {#if $transferData.toAddress}
        <StatusAddress toAddress={$transferData.toAddress} />
    {/if}
    {#if $transferData.toAccount}
        <StatusAccount toAccount={$transferData.toAccount} />
    {/if}
    {#if $transferData.quantity}
        <StatusQuantity quantity={$transferData.quantity} {token} />
    {/if}
    {#if $transferData.quantity && $txFee}
        <StatusFee txFee={$txFee} quantity={$transferData.quantity} />
    {/if}
    {#if $activeBlockchain && $activeBlockchain.id !== "fio"}
        <StatusMemo memo={$transferData.memo} />
    {/if}
</div>

<style type="scss">
    .container {
        margin-top: 1em;
    }
</style>
