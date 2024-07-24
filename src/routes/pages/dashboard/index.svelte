<script lang="ts">
    import type { Readable } from "svelte/store";
    import { derived } from "svelte/store";
    import { Asset } from "@wharfkit/antelope";
    import { Int128 } from "@wharfkit/antelope";
    import Page from "./page.svelte";
    import SegmentGroup from "$lib/components/elements/segment/group.svelte";
    import Segment from "$lib/components/elements/segment.svelte";

    import { activeBlockchain, currentAccount } from "$lib/app/store";

    import { systemToken, systemTokenKey } from "$lib/stores/tokens";

    import { balances } from "$lib/stores/balances";
    import { stateREX } from "../resources/resources";
    import { delegations } from "../delegations/delegations";

    export const handleNaviClick = null;
    /**
     * staked value
     *
     * cal by cpu_weight + net_weight
     */
    const delegatedTokens = derived(
        [currentAccount, delegations],
        ([$currentAccount, $delegations]) => {
            let delegated = 0;
            if (
                $currentAccount &&
                $delegations &&
                $delegations.rows.length > 0
            ) {
                $delegations.rows
                    .filter((record) =>
                        record.from.equals($currentAccount.account_name),
                    )
                    .forEach((record) => {
                        delegated += record.cpu_weight.value;
                        delegated += record.net_weight.value;
                    });
            }
            return delegated;
        },
    );

    /**
     * rex value
     * 
     * currentAccount.rex_info.rex_balance.value * stateREX.value
     
     * stateREX: query api and interval queury
     *
     */

    const rexTokens: Readable<number> = derived(
        [currentAccount, stateREX, systemToken],
        ([$currentAccount, $stateREX, $systemToken]) => {
            if (
                $currentAccount &&
                $currentAccount.rex_info &&
                $stateREX &&
                $stateREX.value
            ) {
                if ($stateREX.value === 0.0001) {
                    const pool = $stateREX;
                    if (!$systemToken || !pool) {
                        return 0;
                    }
                    const { total_lendable, total_rex } = pool;
                    const R1 = total_rex.units.adding(
                        $currentAccount.rex_info.rex_balance.units,
                    );
                    const S1 = Int128.from(R1)
                        .multiplying(total_lendable.units)
                        .dividing(total_rex.units);
                    const result = S1.subtracting(total_lendable.units);
                    return Asset.fromUnits(result, $systemToken!.symbol).value;
                } else {
                    return (
                        $stateREX.value *
                        $currentAccount.rex_info.rex_balance.value
                    );
                }
            }
            return 0;
        },
    );

    /**
     * cal by balanceValue, rexValue, stakedValue
     */
    const totalSystemTokens: Readable<Asset> = derived(
        [balances, currentAccount, delegatedTokens, rexTokens, systemTokenKey],
        ([$balances, $currentAccount, $delegated, $rex, $systemTokenKey]) => {
            let amount = 0;
            //balance
            if ($currentAccount) {
                $balances
                    .filter(
                        (record) =>
                            record.account.equals(
                                $currentAccount.account_name,
                            ) && record.tokenKey === $systemTokenKey,
                    )
                    .map((record) => {
                        amount += record.quantity.value;
                    });
            }
            // staked
            if ($delegated) {
                amount += $delegated;
            }
            //rex
            if ($rex) {
                amount += $rex;
            }
            return Asset.from(amount, $activeBlockchain.coreTokenSymbol);
        },
    );

    function sleep(delay: number) {
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
</script>

<Page title="Account" subtitle="test">
    {#if $balances}
        <div class="container">
            <div class="balances">
                <SegmentGroup>
                    <Segment background="image">
                        <div class="info">
                            <span class="label">
                                Total {$totalSystemTokens.symbol.name} Balance
                            </span>
                            <span class="amount"
                                >{$totalSystemTokens.value}</span
                            >
                            <span class="symbol"
                                >{$totalSystemTokens.symbol.name}</span
                            >
                        </div>
                        <div class="image">
                            <!-- <TokenImage
                                width="60"
                                height="60"
                                tokenKey={$systemTokenKey}
                            /> -->
                        </div>
                    </Segment>
                    <Segment background="image-alt">
                        <div class="info">
                            <span class="label">Account Value</span>
                            <span class="amount">
                                <!-- {fiatFormat($totalUsdValue)} -->
                                todo
                            </span>
                            <span class="symbol">USD</span>
                        </div>
                        <div class="icon">$</div>
                    </Segment>
                </SegmentGroup>
            </div>
        </div>
    {/if}
</Page>

<style lang="scss">
    .container {
        margin-top: 16px;
    }

    .balances {
        :global(.segment) {
            display: flex;
            align-items: center;
        }
        .info {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        .label {
            font-weight: bold;
            font-size: 10px;
            line-height: 12px;
            letter-spacing: 0.1px;
            text-transform: uppercase;
            color: var(--main-black);
        }
        .amount {
            font-size: 20px;
            line-height: 24px;
            /* identical to box height */
            margin: 10px 0 6px;
            color: var(--black);
        }
        .symbol {
            font-size: 16px;
            line-height: 19px;
            color: var(--black);
        }
        .icon {
            width: 60px;
            line-height: 60px;
            font-size: 38px;
            font-weight: 300;
            text-align: center;
            color: #000000;
            background: #ffffff;
            border-radius: 50%;
        }
    }

    .options {
        text-align: right;
    }

    @media only screen and (max-width: 999px) {
        .balances {
            padding: 0 25px;
        }
    }
</style>
