import { get } from "svelte/store";
import { Struct } from "@wharfkit/session";
import { Name } from "@wharfkit/session";
import { Asset } from "@wharfkit/session";

import type { PermissionLevelType, TransactArgs, TransactOptions, TransactResult } from "@wharfkit/session";

import { activeSession } from "./auth";
import { systemToken } from "./tokens";


export async function send(data: Transfer) {
    console.log("transact.ts=================send", data)
    const authorization: PermissionLevelType[] = [
        get(activeSession)!.permissionLevel,
    ];
    const args: TransactArgs = {
        action: {
            authorization: authorization,
            account: get(systemToken)!.contract,
            name: Name.from("transfer"),
            data: data,
        }
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
