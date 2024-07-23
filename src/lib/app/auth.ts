import { PermissionLevel } from '@wharfkit/antelope';
import { ChainId, SigningRequest } from '@wharfkit/signing-request'


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

const transport = new Transport({
    requestStatus: false,
})

// transport allready defined linkStorage
const link = new Link({
    transport: transport,
    chains: chains.map((chain) => ({ chainId: chain.chainId, nodeUrl: getClient(chain) }))
})

export async function init() {
    console.log("auth.ts==============================start")
    await sleep(1000)
    console.log("auth.ts, localStorage = ", localStorage)
    const list = await link.listSessions(appId)
    console.log("auth.ts, listSessions = ", list)
    let session = await link.restoreSession(appId)
    availableSessions.set(list)
    if (session) {
        activeSession.set(session)
    }
    console.log("auth.ts==============================finish")
}

export async function login() {
    console.log('auth.ts---start')
    const result = await link.login(appId)
    console.log(`auth.ts---result: ${result}`)
    if (result.account) {
        // populate account cache with the account returned by login so we don't need to re-fetch it
        storeAccount(result.account, result.session.chainId)
    }
    const list = await link.listSessions(appId)
    availableSessions.set(list)
    activeSession.set(result.session)
    console.log('auth.ts---finish')
}