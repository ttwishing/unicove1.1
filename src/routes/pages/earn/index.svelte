<script lang="ts">
    import type { Readable, Writable } from "svelte/store";
    import { derived, writable, get } from "svelte/store";
    import { type AnyAction, Asset, Int64, Int128 } from "@wharfkit/antelope";

    import { currentAccount, activeSession } from "$lib/wharfkit/auth";
    import type { Token } from "$lib/wharfkit/tokens";
    import { systemTokenKey, systemToken } from "$lib/wharfkit/tokens";
    import { balances } from "$lib/wharfkit/balances";

    import { stake } from "$lib/wharfkit/transact";

    import { convertRexToEos, convertEosToRex } from "$lib/utils/rex";

    import {
        REXDeposit,
        REXWithdraw,
        REXBUYREX,
        REXSELLREX,
    } from "$lib/app/abi-types";

    import type { FormTransaction } from "$lib/app/ui-types";

    import { rexIsAvailable } from "$lib/utils/rex";

    import Page from "../../layout/page.svelte";
    import TransactionForm from "$lib/components/elements/form/transaction.svelte";

    // import { stateREX } from "$lib/stores/resources";
    import { Step } from "./types";
    import type { REXInfo } from "./types";
    import REXError from "./step/error.svelte";
    import REXBootstrap from "./step/bootstrap.svelte";
    import REXOverview from "./step/overview.svelte";
    import REXStake from "./step/stake.svelte";
    import REXUnstake from "./step/unstake.svelte";
    // import REXClaim from "./step/confirm.svelte";
    import REXConfirm from "./step/confirm.svelte";
    import { onDestroy, onMount } from "svelte";
    import { getClient } from "$lib/app/api-client";

    let selectedAmount: string;
    let selectedAction: string;
    let onConfirmBack: () => void;
    let error: string = "";

    $: {
        console.log("selectedAmount = " + selectedAmount);
        console.log("selectedAction = " + selectedAction);
        // if (!rexIsAvailable($activeBlockchain)) {
        //     window.location.href = window.origin;
        // }
    }

    /**
     * available system token(use to send or earn)
     *
     * used to stake
     */
    const availableSystemTokens: Readable<Asset | undefined> = derived(
        [balances, currentAccount, systemTokenKey],
        ([$balances, $currentAccount, $systemTokenKey]) => {
            let amount = 0;
            if ($systemTokenKey && $currentAccount) {
                $balances
                    .filter((record) => record.tokenKey === $systemTokenKey)
                    .map((record) => {
                        amount += record.quantity.value;
                    });

                return Asset.from(amount, $currentAccount!.systemToken);
            }
        },
    );

    // /**
    //  * compare with systemToken(lib/stores/tokens)
    //  *
    //  * this have price
    //  */
    // const systemToken: Readable<Token | undefined> = derived(
    //     [systemTokenKey, tokens],
    //     ([$systemTokenKey, $tokens]) => {
    //         let token = $tokens.find((t: Token) => t.key === $systemTokenKey);
    //         return token;
    //     },
    // );

    /**
     * apy
     * total: current staked balance
     * savings: used to unstake
     * matured+$rexEOSBalance: used to withdraw
     */
    const rexInfo: Readable<REXInfo> = derived(
        [currentAccount, systemToken],
        ([$currentAccount, $systemToken]) => {
            console.log("rexInfo=============================");
            let defaultZero = Asset.from(0, $systemToken!.symbol);
            let total = defaultZero;
            let savings = defaultZero;
            let matured = defaultZero;
            let apy = "";
            // const fiveYearsFromNow =
            //     new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 5;
            // if ($currentAccount && $currentAccount.data) {
            //     const annualReward = 31250000;
            //     // const totalStaked = Number($stateREX.total_lendable.value);
            //     // apy = ((annualReward / totalStaked) * 100).toFixed(2);
            //     if ($currentAccount && $currentAccount.data.rex_info) {
            //         const rexBalance =
            //             $stateREX.value *
            //             $currentAccount.data.rex_info.rex_balance.value;
            //         // console.log("rexBalance = ", rexBalance);
            //         // console.log("apy = ", apy);
            //         total = convertRexToEos(
            //             $currentAccount.data.rex_info.rex_balance.value,
            //             $stateREX,
            //             $systemToken,
            //         );
            //         // console.log("total = ", total);
            //         matured = convertRexToEos(
            //             Asset.fromUnits(
            //                 $currentAccount.data.rex_info.matured_rex,
            //                 $currentAccount.data.rex_info.rex_balance.symbol,
            //             ).value,
            //             $stateREX,
            //             $systemToken,
            //         );
            //         let savingsBucket =
            //             $currentAccount.data.rex_info.rex_maturities.find(
            //                 (maturity) =>
            //                     +new Date(maturity.first!.toString()) >
            //                     +fiveYearsFromNow,
            //             );
            //         if (savingsBucket) {
            //             savings = convertRexToEos(
            //                 Asset.fromUnits(
            //                     savingsBucket.second!,
            //                     $currentAccount.data.rex_info.rex_balance
            //                         .symbol,
            //                 ).value,
            //                 $stateREX,
            //                 $systemToken,
            //             );
            //         }
            //     }
            // }
            return { apy, total, savings, matured };
        },
    );

    rexInfo.subscribe((value) => {
        console.log("###rexInfo = ", value);
    });
    const rexToken: Readable<Token> = derived(
        [systemToken, rexInfo],
        ([$systemToken, $rexInfo]) => {
            let tokenValue = $systemToken!;
            let newToken = { ...tokenValue };
            newToken.balance = $rexInfo.total;
            return newToken;
        },
    );
    /**
     * check if have staked
     */
    const defaultStep: Readable<Step> = derived(rexInfo, ($rexInfo) => {
        let result: Step = Step.Bootstrap;
        if ($rexInfo && $rexInfo.total.value != 0) {
            result = Step.Overview;
        }
        return result;
    });

    /**
     * $rexInfo.matured+rexEOSBalance: used to withdraw
     */
    const rexEOSBalance: Writable<Asset> = writable(
        Asset.from(0, $systemToken!.symbol),
    );

    let unsubscribe: any = null;

    onMount(async () => {
        // const client = getClient($activeBlockchain.chainId);
        // unsubscribe = currentAccount.subscribe(async (account) => {
        //     const result = await client.v1.chain.get_table_rows({
        //         code: "eosio",
        //         scope: "eosio",
        //         table: "rexfund",
        //         json: true,
        //         lower_bound: $currentAccount?.account_name,
        //         upper_bound: $currentAccount?.account_name,
        //     });
        //     if (result.rows.length > 0) {
        //         rexEOSBalance.set(
        //             Asset.from(result.rows[0].balance, $systemToken!.symbol),
        //         );
        //     }
        // });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    const initialStep: Step = Step.Bootstrap;
    const step: Writable<Step> = writable(initialStep, () => {
        const unsubscribeStep = defaultStep.subscribe((s) => {
            let current: Step = get(step);
            if (current === Step.Bootstrap || current == Step.Overview) {
                if (current != s) {
                    step.set(s);
                }
            }
        });
        return () => {
            unsubscribeStep();
        };
    });

    function switchStep(s: Step) {
        step.set(s);
    }

    function toStakeConfirm(fromStep: Step) {
        if (fromStep === Step.Stake || fromStep === Step.Bootstrap) {
            selectedAction = "Stake";
        } else if (fromStep === Step.Claim) {
            selectedAction = "Claim";
        } else {
            selectedAction = "Unstake";
        }
        onConfirmBack = () => {
            switchStep(fromStep);
        };
        switchStep(Step.Confirm);
    }

    // Create a derived store of the rex field we expect to be modified
    // export const rexField = derived([currentAccount], ([$currentAccount]) => {
    //     if (
    //         $currentAccount &&
    //         $currentAccount.rex_info &&
    //         $currentAccount.rex_info.rex_balance
    //     ) {
    //         return $currentAccount.rex_info.rex_balance;
    //     }
    //     return Asset.from(0, $systemToken!.symbol);
    // });

    function resetCallback() {
        step.set(get(defaultStep));
    }

    function retryCallback() {
        step.set(Step.Confirm);
    }

    async function handleConfirm(context: FormTransaction) {
        const actions = getActionData();
        console.log("handleConfirm===========================");
        console.log("actions = ", actions);
        try {
            const result = await stake(actions);
            // If the context exists and this is part of a FormTransaction
            if (context) {
                // Pass the transaction ID to the parent
                // const txid = String(result.response.transaction.id);
                // context.setTransaction(txid);
                // // Await an update on the field expected for this transaction
                // context.awaitAccountUpdate(rexField);
            }
        } catch (e: any) {
            console.warn("Error during transact", e);
            if (context) {
                let msg = String(e);
                if (e.details && e.details.length > 0 && e.details[0].message) {
                    msg = e.details[0].message;
                }
                context.setTransactionError(msg);
            }
        }
    }

    function getActionData() {
        if (selectedAction === "Stake") {
            return getStakeAction();
        }
        // else if (selectedAction === "Unstake") {
        //     return getUnstakeAction();
        // } else if (selectedAction === "Claim") {
        //     return getClaimAction();
        // }
        else {
            throw new Error("Unknown action");
        }
    }

    function getStakeAction(): AnyAction[] {
        return [
            {
                authorization: [$activeSession!.permissionLevel],
                account: "eosio",
                name: "deposit",
                data: REXDeposit.from({
                    owner: $activeSession!.actor,
                    amount: Asset.from(
                        Number(selectedAmount),
                        $systemToken!.symbol,
                    ),
                }),
            },
            {
                authorization: [$activeSession!.permissionLevel],
                account: "eosio",
                name: "buyrex",
                data: REXBUYREX.from({
                    from: $activeSession!.actor,
                    amount: Asset.from(
                        Number(selectedAmount),
                        $systemToken!.symbol,
                    ),
                }),
            },
        ];
    }

    // function getUnstakeAction() {
    //     let rexAmount = convertEosToRex(
    //         Number(selectedAmount),
    //         $stateREX,
    //         $systemToken,
    //     );
    //     return [
    //         {
    //             authorization: [$activeSession!.auth],
    //             account: "eosio",
    //             name: "mvfrsavings",
    //             data: REXWithdraw.from({
    //                 owner: $activeSession!.auth.actor,
    //                 amount: rexAmount,
    //             }),
    //         },
    //     ];
    // }

    // function getClaimAction() {
    //     const actions: AnyAction[] = [
    //         {
    //             authorization: [$activeSession!.auth],
    //             account: "eosio",
    //             name: "withdraw",
    //             data: REXWithdraw.from({
    //                 owner: $activeSession!.auth.actor,
    //                 amount: Asset.from(
    //                     Number(selectedAmount),
    //                     $systemToken!.symbol,
    //                 ),
    //             }),
    //         },
    //     ];

    //     if (Number($rexEOSBalance.value) < Number(selectedAmount)) {
    //         const difference =
    //             Number(selectedAmount) - Number($rexEOSBalance.value);
    //         const rexAmount = convertEosToRex(
    //             difference,
    //             $stateREX,
    //             $systemToken,
    //         );
    //         actions.unshift({
    //             authorization: [$activeSession!.auth],
    //             account: "eosio",
    //             name: "sellrex",
    //             data: REXSELLREX.from({
    //                 from: $activeSession!.auth.actor,
    //                 rex: rexAmount,
    //             }),
    //         });
    //     }

    //     return actions;
    // }
</script>

<Page divider={$step === Step.Bootstrap || $step === Step.Overview}>
    <TransactionForm {resetCallback} {retryCallback}>
        {#if $step === Step.Error}
            <REXError {error} handleBack={() => switchStep($defaultStep)} />
        {:else if $step === Step.Bootstrap}
            <REXBootstrap
                bind:amount={selectedAmount}
                rexInfo={$rexInfo}
                availableTokens={$availableSystemTokens}
                nextStep={() => toStakeConfirm(Step.Bootstrap)}
            />
        {:else if $step === Step.Overview}
            <REXOverview
                availableTokens={$availableSystemTokens}
                rexInfo={$rexInfo}
                rexEOSBalance={$rexEOSBalance}
                toStake={() => switchStep(Step.Stake)}
                toUnstake={() => switchStep(Step.Unstake)}
                toClaim={() => switchStep(Step.Claim)}
            />
        {:else if $step === Step.Stake}
            <REXStake
                bind:amount={selectedAmount}
                rexInfo={$rexInfo}
                token={$systemToken}
                availableTokens={$availableSystemTokens}
                nextStep={() => toStakeConfirm(Step.Stake)}
                handleBack={() => switchStep($defaultStep)}
            />
        {:else if $step === Step.Unstake}
            <REXUnstake
                bind:amount={selectedAmount}
                rexInfo={$rexInfo}
                token={$rexToken}
                availableTokens={$rexInfo.savings}
                nextStep={() => toStakeConfirm(Step.Unstake)}
                handleBack={() => switchStep($defaultStep)}
            />
        {:else if $step === Step.Confirm}
            <REXConfirm
                action={selectedAction}
                amount={Asset.from(
                    Number(selectedAmount),
                    $availableSystemTokens.symbol,
                )}
                token={$systemToken}
                tokenKey={$systemTokenKey}
                {handleConfirm}
                handleBack={onConfirmBack}
            />
        {/if}
    </TransactionForm>
</Page>

<style lang="scss">
</style>
