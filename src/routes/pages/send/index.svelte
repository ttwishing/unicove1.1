<script lang="ts">
    import type { Readable } from "svelte/store";
    import { derived } from "svelte/store";
    import Page from "../../layout/page.svelte";
    import TransactionForm from "$lib/components/elements/form/transaction.svelte";
    import TransferMain from "./main.svelte";

    import { transferData } from "./transfer";
    import { activeSession } from "$lib/wharfkit/store";
    import { systemToken as token } from "$lib/wharfkit/stores/tokens";
    import { balances } from "$lib/wharfkit/stores/balances";
    import type { Balance } from "$lib/wharfkit/stores/balances";

    function retryCallback() {}

    function resetCallback() {}

    function resetData() {}

    // const token: Readable<Token | undefined> = derived(
    //     [activeSession, systemTokenKey, transferData, tokens, balances],
    //     ([
    //         $activeSession,
    //         $systemTokenKey,
    //         $transferData,
    //         $tokens,
    //         $balances,
    //     ]) => {
    //         if ($activeSession && $systemTokenKey && $tokens) {
    //             // If this transfer session data has a token key, use it first
    //             if (!$transferData.tokenKey) {
    //                 return $tokens.find((t) => t.key === $systemTokenKey);
    //             }
    //             const token = $tokens.find(
    //                 (t) => t.key === $transferData.tokenKey,
    //             );

    //             if (token) {
    //                 return token;
    //             }
    //             const balance = $balances.find(
    //                 (b) => b.tokenKey === $transferData.tokenKey,
    //             );

    //             return balance && tokenFromBalance(balance);
    //         }
    //     },
    // );

    const balance: Readable<Balance | undefined> = derived(
        [activeSession, balances, token],
        ([$activeSession, $balances, $token]) => {
            if ($token) {
                return $balances.find((b) => b.tokenKey === $token.key);
            }
        },
    );
</script>

<Page divider={false}>
    <TransactionForm {resetCallback} {retryCallback}>
        <div class="container">
            <TransferMain {balance} {token} {resetData} />
        </div>
    </TransactionForm>
</Page>

<style lang="scss">
    .test {
        width: 100px;
        height: 100px;
        background-color: red;
    }
    .container {
        border: 1px solid var(--divider-grey);
        border-radius: 20px;
        padding: 26px;
        :global(.button) {
            margin-top: 31px;
        }
    }
</style>
