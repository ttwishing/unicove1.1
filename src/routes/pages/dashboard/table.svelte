<script lang="ts">
    import { Asset } from "@wharfkit/antelope";
    import { derived } from "svelte/store";
    import type { Readable } from "svelte/store";

    import { activeSession } from "$lib/app/store";
    import { createBalanceFromToken } from "$lib/stores/balances";
    import type { Balance } from "$lib/stores/balances";
    import { systemToken, systemTokenKey } from "$lib/stores/tokens";

    import TokenHeaderRow from "./headerrow.svelte";
    import TokenRow from "./row.svelte";

    export let balances: Readable<Balance[] | undefined>;
    export let delegatedTokens: Readable<number>;
    export let rexTokens: Readable<number>;

    /**
     * other tokens
     */
    const records: Readable<Balance[] | undefined> = derived(
        [activeSession, balances, systemTokenKey],
        ([$activeSession, $balances, $systemTokenKey]) => {
            const results = [];
            if ($activeSession && $balances) {
                results.push(
                    ...$balances.filter(
                        (b) =>
                            b.chainId.equals($activeSession.chainId) &&
                            b.account.equals($activeSession.auth.actor) &&
                            b.tokenKey !== $systemTokenKey,
                    ),
                );
            }
            return results;
        },
    );

    /**
     * systemToken
     */
    const systemTokenBalance: Readable<Balance | undefined> = derived(
        [activeSession, balances, systemTokenKey],
        ([$activeSession, $balances, $systemTokenKey]) => {
            if ($activeSession && $balances) {
                return $balances.find(
                    (b) =>
                        b.chainId.equals($activeSession.chainId) &&
                        b.account.equals($activeSession.auth.actor) &&
                        b.tokenKey === $systemTokenKey,
                );
            }
        },
    );

    const rexBalance: Readable<Balance | undefined> = derived(
        [activeSession, rexTokens, systemToken],
        ([$activeSession, $rexTokens, $systemToken]) => {
            if ($activeSession && $rexTokens && $systemToken) {
                const token = createBalanceFromToken(
                    $activeSession,
                    $systemToken,
                    Asset.from($rexTokens, $systemToken.symbol),
                );
                return token;
            }
        },
    );

    const stakedBalance: Readable<Balance | undefined> = derived(
        [activeSession, delegatedTokens, systemToken],
        ([$activeSession, $delegatedTokens, $systemToken]) => {
            if ($activeSession && $delegatedTokens && $systemToken) {
                const token = createBalanceFromToken(
                    $activeSession,
                    $systemToken,
                    Asset.from($delegatedTokens, $systemToken.symbol),
                );
                return token;
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
