import { PermissionLevel } from '@wharfkit/antelope';
import { ChainId, SigningRequest } from '@wharfkit/signing-request'
import { get } from 'svelte/store'

import { Link } from "$lib/anchor-link/link"
import Transport from '$lib/anchor-link-browser-transport'

import { appId, chains } from './config'
import { getClient } from './api-client'
import { activeSession, availableSessions } from './store'
import { storeAccount } from '$lib/stores/account-provider';

export interface SessionLike {
    auth: PermissionLevel
    chainId: ChainId
}

function sleep(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

/** Compare two session-ish objects. */
export function sessionEquals(a: SessionLike, b: SessionLike) {
    return a.auth.equals(b.auth) && a.chainId.equals(b.chainId)
}

const transport = new Transport({
    requestStatus: false,
})

// transport allready defined linkStorage
const link = new Link({
    transport: transport,
    chains: chains.map((chain) => ({ chainId: chain.chainId, nodeUrl: getClient(chain) }))
})

export async function init() {
    const list = await link.listSessions(appId)
    let session = await link.restoreSession(appId)
    availableSessions.set(list)
    if (session) {
        activeSession.set(session)
    }
}

export async function login() {
    console.log("auth.ts======================login")
    console.log("appId ", appId)
    const result = await link.login(appId)
    if (result.account) {
        // populate account cache with the account returned by login so we don't need to re-fetch it
        storeAccount(result.account, result.session.chainId)
    }
    const list = await link.listSessions(appId)
    availableSessions.set(list)
    activeSession.set(result.session)
}


/** Remove existing session. */
export async function logout(id: SessionLike) {
    console.log("logout>>>>>>>>>>>>>>>>>>>>>>.")
    const session = await link.restoreSession(appId, id.auth, id.chainId)
    if (session) {
        await session.remove()
        const list = await link.listSessions(appId)
        let active = get(activeSession)
        if (active && sessionEquals(active, session)) {
            // update active session if we logged out from it
            if (list.length > 0) {
                activate(list[0])
            } else {
                activeSession.set(undefined)
            }
        }
        availableSessions.set(list)
    }
}

export async function activate(id: SessionLike) {
    const session = await link.restoreSession(appId, id.auth, id.chainId)
    if (!session) {
        throw new Error('No such session')
    }
    activeSession.set(session)

    // if (get(activeEvmSession)) {
    //     activeEvmSession.set(undefined)
    //     await startEvmSession()
    //     fetchBalances(get(activeSession), true)
    // }
}