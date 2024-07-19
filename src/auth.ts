// import { PermissionLevel } from '@wharfkit/antelope';
// import { ChainId } from '@wharfkit/signing-request';


import { Link } from 'anchor-link'
// import type { LinkTransport } from '$lib/components/anchor-link/link-transport';
// import { SigningRequest } from '@wharfkit/signing-request';

// import { appId, chains } from './config'


// export interface SessionLike {
//     auth: PermissionLevel
//     chainId: ChainId
// }

// function sleep(delay: number) {
//     return new Promise((resolve) => setTimeout(resolve, delay));
// }

// const transport: LinkTransport = {

//     onRequest(request: SigningRequest, cancel: (reason: string | Error) => void) {

//     }

// }

// const link = new Link({
//     transport: transport,
//     chains: chains.map((chain) => ({ chainId: chain.chainId, nodeUrl: getClient(chain) }))
// })

export async function init() {
    console.log("auth.ts==============================start")

    //     const list = await link.listSessions(appId)
    //     let session = await link.restoreSession(appId)
    //     availableSessions.set(list)
    //     if (session) {
    //         activeSession.set(session)
    //     }
}