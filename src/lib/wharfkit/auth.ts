import { type LoginOptions, type LoginResult, type Session } from "@wharfkit/session";
import type { SerializedSession, RestoreArgs } from "@wharfkit/session";
import { sessionKit, updateSession } from "./wharf";

import { availableSessions } from "./store";

export function sessionEquals(session: SerializedSession, activeSession?: Session): boolean {
    if (!activeSession)
        return false
    return String(activeSession.chain.id) === String(session.chain) && String(activeSession.actor) === String(session.actor)
}

export async function init() {
    console.log("auth.ts============================init")
    let session = await sessionKit.restore()
    console.log("session = ", session)
    if (session) {
        updateSession(session)
    }
    const list = await sessionKit.getSessions();
    availableSessions.set(list);
}

export async function login(options?: LoginOptions) {
    const result: LoginResult = await sessionKit.login(options);
    updateSession(result.session)
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
        updateSession(undefined)
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
    updateSession(session)
}


