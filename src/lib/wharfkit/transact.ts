import { get } from "svelte/store";

import type { TransactArgs, TransactOptions, TransactResult } from "@wharfkit/session";

import { currentAccount } from "./store";
import { wharf } from "./wharf";

import { Contract, type ActionsArgs } from "@wharfkit/contract";
import type { REXDeposit, REXBuy, REXWithdraw } from "./contracts/system"
import type { Transfer } from "./contracts/token"

// fixme: kurt, How to determine whether a chain supports an action, like ChainConfig.chainFeatures?

export async function stake(deposit: REXDeposit, buy: REXBuy) {
    console.log("stake=======================")
    if (!get(wharf))
        throw new Error("No active session")

    const actionArgs: ActionsArgs[] = [
        {
            name: "deposit",
            data: deposit
        }, {
            name: "buyrex",
            data: buy
        }
    ]
    const contract: Contract = await get(wharf)!.getSystemContract()
    const actions = contract.actions(actionArgs)
    console.log("actions = ", actions)
    const args: TransactArgs = {
        actions: actions
    }
    return await transact(args)
}

export async function unstake(withdraw: REXWithdraw) {
    console.log("unstake=======================")
    if (!get(wharf))
        throw new Error("No active session")

    const contract: Contract = await get(wharf)!.getSystemContract()
    const action = contract.action("mvfrsavings", withdraw)
    console.log("action = ", action)
    const args: TransactArgs = {
        action: action
    }
    return await transact(args)
}

export async function send(data: Transfer) {
    console.log("send=======================")
    console.log("data = ", data)
    if (!get(currentAccount))
        throw new Error("No login account")

    // const action = get(currentAccount)!.token.contract.action("transfer", data)
    const contract: Contract = await get(wharf)!.getTokenContract()
    const action = contract.action("transfer", data)
    console.log("action = ", action)
    const args: TransactArgs = {
        action: action
    }
    return await transact(args)
}

async function transact(args: TransactArgs, options?: TransactOptions) {
    if (!get(wharf))
        throw new Error("No active session")
    const result: TransactResult = await get(wharf)!.transact(args, options)
    console.log("transact_result = ", result)
    return result;
}



