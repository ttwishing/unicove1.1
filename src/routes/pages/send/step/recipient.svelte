<script lang="ts">
    import { PublicKey, Name } from "@wharfkit/antelope";
    import type { Readable } from "svelte/store";
    import { writable } from "svelte/store";

    import { activeBlockchain, activeSession } from "$lib/app/store";
    import type { Balance } from "$lib/stores/balances";
    import type { Token } from "$lib/stores/tokens";

    import Button from "$lib/components/elements/button.svelte";
    import InputLabel from "$lib/components/elements/input/label.svelte";
    import InputAccountLookup from "$lib/components/elements/input/account/lookup.svelte";
    import InputPublicKey from "$lib/components/elements/input/publicKey.svelte";
    import Form from "$lib/components/elements/form.svelte";

    import { transferData, Step } from "../transfer";
    import Text from "$lib/components/elements/text.svelte";
    import Icon from "$lib/components/elements/icon.svelte";

    export let balance: Readable<Balance | undefined>;
    export let token: Token;

    let loading = false;
    let toAddress: string = String($transferData.toAddress || "");
    let toAccount: string = String($transferData.toAccount || "");

    function confirmChange() {
        transferData.update((data) => ({
            ...data,
            toAccount:
                toAccount && toAccount.length > 0
                    ? Name.from(toAccount)
                    : undefined,
            toAddress:
                toAddress && toAddress.length > 0
                    ? PublicKey.from(toAddress)
                    : undefined,
            step: data.backStep || Step.Amount,
            backStep: undefined,
        }));
    }
</script>

<div class="container">
    {#if balance && token}
        <Form on:submit={confirmChange}>
            <InputLabel>To</InputLabel>
            {#if $activeBlockchain && $activeBlockchain.id === "fio"}
                <InputPublicKey
                    bind:value={toAddress}
                    focus={false}
                    fluid={false}
                    name="to"
                    placeholder="Enter public key"
                />
            {:else}
                <InputAccountLookup
                    bind:loading
                    bind:value={toAccount}
                    focus
                    fluid
                    name="to"
                    placeholder="Enter account name"
                    activeSession={$activeSession}
                />
            {/if}
            <Button
                style="primary"
                disabled={loading}
                size="large"
                fluid
                formValidation
                on:action={confirmChange}
            >
                {#if loading}
                    <Icon spin name="life-buoy" />
                {/if}
                {#if $transferData.backStep}
                    <Text>Done</Text>
                {:else}
                    <Text>Next</Text>
                {/if}
            </Button>
        </Form>
    {:else}
        No balance for this token to send!
    {/if}
</div>

<style type="scss">
</style>
