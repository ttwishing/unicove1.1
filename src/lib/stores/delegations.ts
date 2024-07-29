import type { Readable } from "svelte/motion";
import { derived } from "svelte/store";
import { activeBlockchain, currentAccount } from "$lib/app/store";

import { getClient } from "$lib/app/api-client";

import { DelegatedBandwidth } from "$lib/app/abi-types";
import { ChainFeatures } from "$lib/app/config";

interface Delegations {
    rows: DelegatedBandwidth[];
}

let lastResult: any = null

export const delegations: Readable<Delegations> = derived(
    [activeBlockchain, currentAccount],
    ([$activeBlockchain, $currentAccount], set) => {
        if (
            $activeBlockchain &&
            $activeBlockchain.chainFeatures.has(ChainFeatures.Staking) &&
            $currentAccount
        ) {
            getClient($activeBlockchain.chainId)
                .v1.chain.get_table_rows({
                    code: "eosio",
                    table: "delband",
                    scope: $currentAccount.account_name,
                    type: DelegatedBandwidth,
                })
                .then((result) => {
                    lastResult = result
                    set(result);
                })
                .catch((err) => {
                    console.warn("Error retrieving delegations", err);
                    set({ rows: [] });
                });
        }
    },
);