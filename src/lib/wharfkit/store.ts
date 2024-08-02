import { writable } from "svelte/store";
import type { Readable } from "svelte/store";
import { derived } from "svelte/store";
import { get } from "svelte/store";

import { Session } from "@wharfkit/session";
import type { SerializedSession } from "@wharfkit/session";
import { Account } from "@wharfkit/account";
import { chainIdsToIndices } from "@wharfkit/session";

import { accountProvider } from "./stores/account-provider";

export const activeSession = writable<Session | undefined>(undefined)
export const availableSessions = writable<SerializedSession[]>([])
export const currentAccount: Readable<Account | undefined> = derived(
    accountProvider,
    ($accountProvider) => $accountProvider.account
)

currentAccount.subscribe(value => {
    console.log("currentAccount = ", value)
})

export const availableSessionGroup: Readable<SessionGroup[]> = derived(
    availableSessions,
    ($availableSessions) => {
        if ($availableSessions) {
            const chainIds = [
                ...new Set(
                    $availableSessions.map((session) => String(session.chain),
                    ),
                ),
            ];
            return getGroupings(chainIds);
        }
        return [];
    },
);

function getGroupings(chainIds: string[]): SessionGroup[] {
    return chainIds
        .map((chainId) => {
            return {
                chainId,
                name: String(chainIdsToIndices.get(chainId)),
                sessions: get(availableSessions).filter(
                    (s) => String(s.chain) === chainId,
                ),
            };
        })
        .sort((a: SessionGroup, b: SessionGroup) =>
            a.name.localeCompare(b.name),
        );
}

interface SessionGroup {
    chainId: string;
    name: string;
    sessions: SerializedSession[];
}


