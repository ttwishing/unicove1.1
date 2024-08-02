    import { fiatFormat } from "$lib/utils/fiat";

    import { activeBlockchain, currentAccount } from "$lib/app/store";

    import { getToken, systemToken, systemTokenKey } from "$lib/stores/tokens";
    import { tokens } from "$lib/stores/tokens";
    import { activePriceTicker } from "$lib/app/store";

    import { balances } from "$lib/stores/balances";
    import { stateREX } from "$lib/stores/resources";
    import { delegations } from "../../../lib/stores/delegations";

    import TokenTable from "./table.svelte";
    import Number from "./number.svelte";

    export const handleNaviClick = null;
    /**
     * staked value
     *
     * cal by cpu_weight + net_weight
     */
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
     * balance value
     */
    const balanceTokens: Readable<number> = derived(
        [balances, currentAccount],
        ([$balances, $currentAccount]) => {
            let balance = 0;
            if ($currentAccount) {
                $balances
                    .filter(
                        (record) =>
                            record.account.equals(
                                $currentAccount.account_name,
                            ) && record.tokenKey === $systemTokenKey,
                    )
                    .map((record) => {
                        balance += record.quantity.value;
                    });
            }
            return balance;
        },
    );

    /**
     * cal by balanceValue, rexValue, stakedValue
     */
    const totalSystemTokens: Readable<Asset> = derived(
        [balanceTokens, delegatedTokens, rexTokens],
        ([$balanceTokens, $delegated, $rex]) => {
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
            return Asset.from(amount, $activeBlockchain.coreTokenSymbol);
        },
    );

    const delegatedUSD: Readable<number> = derived(
        [delegatedTokens, currentAccount, activePriceTicker],
        ([$delegated, $currentAccount, $price]) => {
            let value = 0;
            if ($currentAccount && $price !== undefined) {
                value += $delegated * $price;
            }
            return value;
        },
    );

    const rexUSD: Readable<number> = derived(
        [rexTokens, currentAccount, activePriceTicker],
        ([$rex, $currentAccount, $price]) => {
            let value = 0;
            if ($currentAccount && $price !== undefined) {
                value += $rex * $price;
            }
            return value;
        },
    );

    const balanceUSD: Readable<number> = derived(
        [balances, currentAccount],
        ([$balances, $currentAccount]) => {
            let value = 0;
            if ($currentAccount) {
                $balances
                    .filter((record) =>
                        record.account.equals($currentAccount.account_name),
                    )
                    .map((record) => {
                        const token = getToken(record.tokenKey);
                        if (token && token.price) {
                            value += record.quantity.value * token.price;
                        }
                    });
            }
            return value;
        },
    );

    const totalUsdValue: Readable<number> = derived(
        [delegatedUSD, rexUSD, balanceUSD],
        ([$delegated, $rex, $balances]) => {
            let value = 0;
            if ($delegated) {
                value += $delegated;
            }
            if ($rex) {
                value += $rex;
            }
            if ($balances) {
                value += $balances;
            }
            return value;
        },
    );
