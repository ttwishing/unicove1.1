import { get } from "svelte/store";
import { Struct } from "@wharfkit/session";
import { Name } from "@wharfkit/session";
import { Asset } from "@wharfkit/session";

import type { AnyAction, TransactArgs, TransactOptions, TransactResult } from "@wharfkit/session";

import { activeSession } from "./store";


export async function stake(actions: AnyAction[]) {
    const args: TransactArgs = {
        actions: actions
    }
    return await transact(args)
}

export async function send(action: AnyAction) {
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

@Struct.type('transfer')
export class Transfer extends Struct {
    @Struct.field('name') from!: Name
    @Struct.field('name') to!: Name
    @Struct.field('asset') quantity!: Asset
    @Struct.field('string') memo!: string
}


@Struct.type('rexdeposit')
export class REXDeposit extends Struct {
    @Struct.field('name') owner!: Name
    @Struct.field('asset') amount!: Asset
}
