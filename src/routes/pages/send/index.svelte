<script lang="ts">
    import type { Readable } from "svelte/motion";
    import { derived } from "svelte/store";
    import { activeSession } from "$lib/app/store";
    import { balances } from "$lib/stores/balances";
    import type { Balance } from "$lib/stores/balances";
    import type { Token } from "$lib/stores/tokens";
    import { systemTokenKey } from "$lib/stores/tokens";

    import Page from "../dashboard/page.svelte";
    import TransactionForm from "./form.svelte";
    import TransferMain from "./main.svelte";

    import { transferData } from "./transfer";
    import { tokens } from "$lib/stores/tokens";
    import { tokenFromBalance } from "$lib/stores/tokens";

    function retryCallback() {}

    function resetCallback() {}

    function resetData() {}

    const token: Readable<Token | undefined> = derived(
        [activeSession, systemTokenKey, transferData, tokens, balances],
        ([
            $activeSession,
            $systemTokenKey,
            $transferData,
            $tokens,
            $balances,
        ]) => {
            if ($activeSession && $systemTokenKey && $tokens) {
                // If this transfer session data has a token key, use it first
                if ($transferData.tokenKey) {
                    const token = $tokens.find(
                        (t) => t.key === $transferData.tokenKey,
                    );

                    if (token) {
                        return token;
                    } else {
                        const balance = $balances.find(
                            (b) => b.tokenKey === $transferData.tokenKey,
                        );

                        return balance && tokenFromBalance(balance);
                    }
                }
                // If the URL has a token key, use it second
                // if (meta) {
                //     const params: TokenKeyParams = {
                //         chainId: $activeBlockchain!.chainId,
                //         contract: Name.from(meta.params.contract),
                //         name: Name.from(meta.params.token),
                //     };
                //     const key = makeTokenKey(params);
                //     const token = $tokens.find((t) => t.key === key);

                //     if (token) {
                //         return token;
                //     }

                //     const balance = $balances.find((b) => b.tokenKey === key);

                //     return balance && tokenFromBalance(balance);
                // }
                // Otherwise return the system token key
                return $tokens.find((t) => t.key === $systemTokenKey);
            }
        },
    );

    const balance: Readable<Balance | undefined> = derived(
        [activeSession, balances, token],
        ([$activeSession, $currentBalances, $token]) => {
            if ($token) {
                return $currentBalances.find((b) => b.tokenKey === $token.key);
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
    .container {
        border: 1px solid var(--divider-grey);
        border-radius: 20px;
        padding: 26px;
        :global(.button) {
            margin-top: 31px;
        }
    }
</style>
