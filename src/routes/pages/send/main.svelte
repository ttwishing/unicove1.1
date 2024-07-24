<script lang="ts">
    import { Name } from "@wharfkit/antelope";
    import { getContext } from "svelte";
    import type { Readable } from "svelte/store";
    import { derived, get } from "svelte/store";

    import TransferRecipient from "./step/recipient.svelte";
    import TransferAmount from "./step/amount.svelte";
    import TransferConfirm from "./step/confirm.svelte";

    import { activeBlockchain, activeSession } from "$lib/app/store";
    import type { Balance } from "$lib/stores/balances";
    import type { Token } from "$lib/stores/tokens";

    import Button from "$lib/components/elements/button.svelte";
    import Icon from "$lib/components/elements/icon.svelte";

    import type { FormTransaction } from "$lib/app/ui-types";
    import { Step } from "./transfer";
    import { transferData } from "./transfer";

    export let balance: Readable<Balance | undefined>;
    export let token: Readable<Token | undefined>;
    export let resetData: () => void;

    async function handleTransfer() {
        console.log("handleTransfer");
    }

    function handleBack() {}
</script>

<div class="container">
    {#if ![Step.Sending].includes($transferData.step)}
        <div class="header">
            {$transferData.step === Step.Receive
                ? "Receive tokens"
                : "Send tokens"}
        </div>
        {#if $transferData.step === Step.Receive}
            <div class="subheader">Use your account name</div>
        {/if}
    {/if}
    {#if [Step.Recipient, Step.Amount, Step.Confirm].includes($transferData.step)}
        {#if $transferData.step === Step.Recipient}
            <div class="subheader">Add recipient</div>
        {/if}
        {#if $transferData.step === Step.Amount}
            <div class="subheader">Select an amount</div>
        {/if}
        {#if $transferData.step === Step.Token}
            <div class="subheader">Select the token</div>
        {/if}
        {#if $transferData.step === Step.Confirm && $transferData.quantity}
            <div class="subheader">Review and sign</div>
        {/if}
        <div class={`progress step-${Number($transferData.step)}`}>
            <div class="step" />
            <div class="step" />
            <div class="step" />
        </div>
    {/if}
    {#if [Step.Sending].includes($transferData.step)}
        <div class="header">
            <!-- <Icon size="huge" name="radio" /> -->
            <div>Sending Tokens</div>
        </div>
        <div class="subheader">Requesting signature from wallet</div>
    {/if}
    {#if $balance && $token}
        {#if $transferData.step === Step.Recipient}
            <TransferRecipient {balance} token={$token} />
        {/if}
        {#if $transferData.step === Step.Amount}
            <TransferAmount {balance} token={$token} />
        {/if}

        {#if $transferData.step === Step.Confirm && $transferData.quantity}
            <TransferConfirm {handleTransfer} token={$token} />
        {/if}
        <!-- {#if $transferData.step === Step.Receive}
            <TransferReceive />
        {/if}
        {#if $transferData.step === Step.Sending}
            <TransferSending token={$token} />
        {/if}  -->
    {:else}
        No balance of this token to transfer!
    {/if}
    {#if ![Step.Receive, Step.Sending].includes($transferData.step)}
        <div class="controls">
            {#if $transferData.step > 1}
                <Button on:action={handleBack} style="no-frame">
                    <Icon size="medium" name="arrow-left" /><span>Back</span>
                </Button>
            {:else}
                <Button href="/" style="no-frame">Cancel</Button>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    .container {
        margin: 0 auto;
        max-width: 28rem;
    }
    .controls {
        text-align: center;
        :global(.button) {
            background: none;
            color: var(--main-blue);
            font-size: 10px;
            text-transform: uppercase;
        }
    }
    .header {
        color: var(--black);
        font-family: Inter;
        font-style: normal;
        font-weight: bold;
        font-size: 24px;
        line-height: 29px;
        text-align: center;
        letter-spacing: -0.47px;
        margin-bottom: 7px;
    }
    .subheader {
        color: var(--dark-grey);
        font-family: Inter;
        font-style: normal;
        font-weight: normal;
        font-size: 16px;
        line-height: 19px;
        text-align: center;
        letter-spacing: -0.18px;
    }
    .progress {
        margin: 18px 0 42px;
        text-align: center;
        .step {
            display: inline-block;
            height: 4px;
            width: 105px;
            margin: 0 3px 0 0;
            background: var(--main-blue);
            opacity: 0.3;
        }
        &.step-1 .step:nth-child(-n + 1),
        &.step-2 .step:nth-child(-n + 2),
        &.step-3 .step:nth-child(-n + 3) {
            opacity: 1;
        }
    }
    @media only screen and (max-width: 600px) {
        .progress {
            margin: 12px 0 24px;
            .step {
                width: 85px;
            }
        }
    }
</style>
