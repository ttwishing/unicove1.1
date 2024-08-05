<script lang="ts">
    import { Asset } from "@wharfkit/antelope";
    import { derived, readable } from "svelte/store";
    import type { Readable } from "svelte/store";
    import TokenHeaderRow from "./headerrow.svelte";
    import TokenRow from "./row.svelte";

    import { activeSession } from "$lib/wharfkit/store";
    import type { Balance } from "$lib/wharfkit/stores/balance-provider";
    import { systemToken } from "$lib/wharfkit/stores/tokens";

    export let systemTokenBalance: Readable<Balance | undefined>;
    export let delegatedTokens: Readable<number>;
    export let rexTokens: Readable<number>;

    /**
     * other tokens, just set empty now.
     */
    const records: Readable<Balance[]> = readable([]);

    // /**
    //  * systemToken
    //  */
    // const systemTokenBalance: Readable<Balance | undefined> = derived(
    //     [activeSession, coreTokenBalance],
    //     ([$activeSession, $coreTokenBalance]) => {
    //         if ($activeSession && $coreTokenBalance) {
    //             return $coreTokenBalance;
    //         }
    //     },
    // );

    const rexBalance: Readable<Balance | undefined> = derived(
        [activeSession, rexTokens, systemToken],
        ([$activeSession, $rexTokens, $systemToken]) => {
            if ($activeSession && $rexTokens && $systemToken) {
                return {
                    quantity: Asset.from($rexTokens, $systemToken.symbol),
                };
            }
        },
    );

    const stakedBalance: Readable<Balance | undefined> = derived(
        [activeSession, delegatedTokens, systemToken],
        ([$activeSession, $delegatedTokens, $systemToken]) => {
            if ($activeSession && $delegatedTokens && $systemToken) {
                return {
                    quantity: Asset.from($delegatedTokens, $systemToken.symbol),
                };
            }
        },
    );
</script>

<div class="records">
    <TokenHeaderRow />
    {#if $systemTokenBalance}
        <TokenRow balance={$systemTokenBalance} />
    {/if}
    {#if $stakedBalance && $systemToken}
        <TokenRow
            balance={$stakedBalance}
            name={`${$systemToken.name} (Staked)`}
            transferable={false}
        />
    {/if}
    {#if $rexBalance && $systemToken}
        <TokenRow
            balance={$rexBalance}
            name={`${$systemToken.name} (REX)`}
            transferable={false}
        />
    {/if}
    {#if $records}
        {#each $records as balance}
            other: <TokenRow {balance} />
        {/each}
    {/if}
</div>

<style lang="scss">
    .records {
        display: flex;
        flex-direction: column;
    }
</style>
