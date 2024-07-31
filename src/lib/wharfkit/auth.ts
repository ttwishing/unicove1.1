import type { LoginOptions, LoginResult, NameType, Session } from "@wharfkit/session";
import { Account } from "@wharfkit/account";
import type { SerializedSession } from "@wharfkit/session";
import { sessionKit, accountKit } from "./wharf";
import { derived, readable, writable, type Writable } from "svelte/store";

export const activeSession = writable<Session | undefined>(undefined)
export const availableSessions = writable<SerializedSession[]>([])
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
    availableSessions.set(list);
}

export async function login(options?: LoginOptions) {
    console.log("auth.ts============================login")
    const result: LoginResult = await sessionKit.login(options);
    activeSession.set(result.session)
    const list = await sessionKit.getSessions();
    availableSessions.set(list);
}

async function loadAccount(actor: NameType) {
    console.log("auth.ts============================loadAccount")
    const account: Account = await accountKit.load(actor)
    currentAccount.set(account)
}

