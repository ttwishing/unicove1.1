import type { Readable } from "svelte/store";
import { derived } from "svelte/store";
import { get } from "svelte/store";
import { activeSession, currentAccount } from "../store";
import { getClient } from "../wharf";

import { DelegatedBandwidth } from "$lib/app/abi-types";

interface Delegations {
    rows: DelegatedBandwidth[];
}

let lastResult: any = null

export const delegations: Readable<Delegations> = derived(
    [currentAccount],
    ([$currentAccount], set) => {
        if (
            $currentAccount
        ) {
            //tudo
            getClient(get(activeSession)!.chain)
                .v1.chain.get_table_rows({
                    code: "eosio",
                    table: "delband",
                    scope: $currentAccount.data.account_name,
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