<script lang="ts">
    import TokenImage from "$lib/components/elements/image/token.svelte";
    import Page from "../../layout/page.svelte";
    import SegmentGroup from "$lib/components/elements/segment/group.svelte";
    import Segment from "$lib/components/elements/segment.svelte";

    import { systemTokenKey } from "$lib/wharfkit/tokens";

    import { balances } from "$lib/wharfkit/balances";
    import { derived, type Readable } from "svelte/store";
    import type { Asset } from "@wharfkit/antelope";

    const balanceTokens: Readable<Asset | undefined> = derived(
        balances,
        ($balances) => {
            return $balances.find((item) => item.tokenKey === $systemTokenKey)
                ?.quantity;
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
                                Total {$balanceTokens.symbol.name} Balance
                            </span>
                            <span class="amount">
                                {$balanceTokens.value}
                            </span>
                            <span class="symbol">
                                {$balanceTokens.symbol.name}
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
            <!-- <TokenTable {balances} {rexTokens} {delegatedTokens} /> -->
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
