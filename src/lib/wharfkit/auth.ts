import { type LoginOptions, type LoginResult, type NameType, type Session } from "@wharfkit/session";
import { Account } from "@wharfkit/account";
import type { SerializedSession } from "@wharfkit/session";
import { sessionKit, accountKit } from "./wharf";
import { derived, writable, type Writable, type Readable } from "svelte/store";
import { get } from "svelte/store";

import { chainIdsToIndices } from "@wharfkit/session";
import type { RestoreArgs } from "@wharfkit/session";

export const activeSession = writable<Session | undefined>(undefined)
export const availableSessions = writable<SerializedSession[]>([])

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

availableSessionGroup.subscribe(value => {
    console.log("availableSessionGroup = ", value)
})

export function sessionEquals(session: SerializedSession, activeSession?: Session): boolean {
    if (!activeSession)
        return false
    return String(activeSession.chain.id) === String(session.chain) && String(activeSession.actor) === String(session.actor)
}

export const currentAccount: Writable<Account | undefined> = writable(undefined, () => {
    const unsubscribe = activeSession.subscribe(value => {
        if (value) {
            loadAccount(value.actor)
        }
    })
    return () => {
        unsubscribe();
    }
})

function sleep(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

export async function init() {
    console.log("auth.ts============================init")
    let session = await sessionKit.restore()
    console.log("session = ", session)
    if (session) {
        activeSession.set(session)
    }
    const list = await sessionKit.getSessions();
    console.log("list = ", list)
    availableSessions.set(list);
}

export async function login(options?: LoginOptions) {
    console.log("auth.ts============================login")
    const result: LoginResult = await sessionKit.login(options);
    activeSession.set(result.session)
    const list = await sessionKit.getSessions();
    availableSessions.set(list);
}

export async function logout(target: SerializedSession) {
    await sessionKit.logout(target);
    const list = await sessionKit.getSessions();
    availableSessions.set(list)
    if (list.length > 0) {
        await activate(list[0]);
    } else {
        activeSession.set(undefined)
    }
}

export async function activate(target: SerializedSession) {
    console.log("auth.ts============================activate")
    const args: RestoreArgs = {
        chain: target.chain,
        actor: target.actor,
        permission: target.permission,
        walletPlugin: target.walletPlugin
    }
    console.log("args = ", args)
    const session = await sessionKit.restore(args)
    console.log("session = ", session)
    if (!session) {
        throw new Error('No such session')
    }
    activeSession.set(session)

}

async function loadAccount(actor: NameType) {
    console.log("auth.ts============================loadAccount")
    const account: Account = await accountKit.load(actor)
    currentAccount.set(account)
}


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


