import { get } from "svelte/store";
import type { NameType, AssetType } from "@wharfkit/session";

import type { AnyAction, TransactArgs, TransactOptions, TransactResult } from "@wharfkit/session";

import { activeSession, currentAccount } from "./store";


export async function stake(actions: AnyAction[]) {
    const args: TransactArgs = {
        actions: actions
    }
    return await transact(args)
}

export async function send(data: TransferData) {
    console.log("send=======================")
    console.log("data = ", data)
    if (!get(currentAccount))
        throw new Error("No login account")

    const action = get(currentAccount)!.token.contract.action("transfer", data)
    const args: TransactArgs = {
        action: action
    }
    return await transact(args)
}

async function transact(args: TransactArgs, options?: TransactOptions) {
    if (!get(activeSession))
        throw new Error("No active session")
    const result: TransactResult = await get(activeSession)!.transact(args, options)
    console.log("transact_result = ", result)
    return result;
}

export interface TransferData {
    from: NameType;
    to: NameType;
    quantity: AssetType;
    memo: string;
}