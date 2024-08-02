<script lang="ts">
    import TokenImage from "$lib/components/elements/image/token.svelte";
    import Page from "../../layout/page.svelte";
    import SegmentGroup from "$lib/components/elements/segment/group.svelte";
    import Segment from "$lib/components/elements/segment.svelte";
    import TokenTable from "./table.svelte";

    import { systemTokenKey } from "$lib/wharfkit/stores/tokens";
    import { systemToken } from "$lib/wharfkit/stores/tokens";

    import { coreTokenBalance } from "$lib/wharfkit/stores/balances";
    import { derived, type Readable } from "svelte/store";
    import { Asset } from "@wharfkit/antelope";
    import { Int128 } from "@wharfkit/antelope";

    import { delegations } from "$lib/wharfkit/stores/delegations";
    import { stateREX } from "$lib/wharfkit/stores/resources";
    import { currentAccount } from "$lib/wharfkit/store";

    const delegatedTokens: Readable<number> = derived(
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
                        record.from.equals($currentAccount.accountName),
                    )
                    .forEach((record) => {
                        delegated += record.cpu_weight.value;
                        delegated += record.net_weight.value;
                    });
            }
            return delegated;
        },
    );

    const rexTokens: Readable<number> = derived(
        [currentAccount, stateREX, systemToken],
        ([$currentAccount, $stateREX, $systemToken]) => {
            if (
                $currentAccount &&
                $currentAccount.data.rex_info &&
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
                        $currentAccount.data.rex_info.rex_balance.units,
                    );
                    const S1 = Int128.from(R1)
                        .multiplying(total_lendable.units)
                        .dividing(total_rex.units);
                    const result = S1.subtracting(total_lendable.units);
                    return Asset.fromUnits(result, $systemToken!.symbol).value;
                } else {
                    return (
                        $stateREX.value *
                        $currentAccount.data.rex_info.rex_balance.value
                    );
                }
            }
            return 0;
        },
    );

    /**
     * balance value
     */
    const balanceTokens: Readable<number> = derived(
        [coreTokenBalance],
        ([$coreTokenBalance]) => {
            let balance = 0;
            if ($coreTokenBalance) {
                balance = $coreTokenBalance.quantity.value;
            }
            return balance;
        },
    );

    /**
     * cal by balanceValue, rexValue, stakedValue
     */
    const totalSystemTokens: Readable<Asset | undefined> = derived(
        [balanceTokens, delegatedTokens, rexTokens],
        ([$balanceTokens, $delegated, $rex]) => {
            if ($currentAccount) {
                let amount = 0;
                //balance
                if ($balanceTokens) {
                    amount += $balanceTokens;
                }
                // staked
                if ($delegated) {
                    amount += $delegated;
                }
                //rex
                if ($rex) {
                    amount += $rex;
                }
                return Asset.from(amount, $currentAccount.systemToken);
            }
        },
    );
</script>

<Page title="Account" subtitle="test">
    {#if $balanceTokens}
        <div class="container">
            <div class="balances">
                <SegmentGroup>
                    <Segment background="image">
                        <div class="info">
                            <span class="label">
                                Total {$totalSystemTokens?.symbol.name} Balance
                            </span>
                            <span class="amount">
                                {$totalSystemTokens?.value}
                            </span>
                            <span class="symbol">
                                {$totalSystemTokens?.symbol.name}
                            </span>
                        </div>
                        <div class="image">
                            <TokenImage
                                width="60"
                                height="60"
                                tokenKey={$systemTokenKey}
                            />
                        </div>
                    </Segment>
                    <Segment background="image-alt">
                        <div class="info">
                            <span class="label">Account Value</span>
                            <span class="amount"> ??? </span>
                            <span class="symbol">USD</span>
                        </div>
                        <div class="icon">$</div>
                    </Segment>
                </SegmentGroup>
            </div>
            <TokenTable {coreTokenBalance} {rexTokens} {delegatedTokens} />
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
