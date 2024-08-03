import { get } from "svelte/store";
import type { NameType, AssetType } from "@wharfkit/session";

import type { TransactArgs, TransactOptions, TransactResult } from "@wharfkit/session";

import { activeSession, currentAccount } from "./store";
import { Contract, type ActionsArgs } from "@wharfkit/contract";
import { getSystemContract, getTokenContract } from "./wharf";


export async function stake(deposit: REXDeposit, buy: REXBuy) {
    console.log("stake=======================")
    if (!get(activeSession))
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
    const contract: Contract = await getSystemContract(get(activeSession)!.chain)
    const actions = contract.actions(actionArgs)
    console.log("actions = ", actions)
    const args: TransactArgs = {
        actions: actions
    }
    return await transact(args)
}

export async function unstake(withdraw: REXWithdraw) {
    console.log("unstake=======================")
    if (!get(activeSession))
        throw new Error("No active session")

    const contract: Contract = await getSystemContract(get(activeSession)!.chain)
    const action = contract.action("mvfrsavings", withdraw)
    console.log("action = ", action)
    const args: TransactArgs = {
        action: action
    }
    return await transact(args)
}

export async function send(data: TransferData) {
    console.log("send=======================")
    console.log("data = ", data)
    if (!get(currentAccount))
        throw new Error("No login account")

    // const action = get(currentAccount)!.token.contract.action("transfer", data)

    const action = (await getTokenContract(get(activeSession)!.chain)).action("transfer", data)
    console.log("action = ", action)
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

export interface REXDeposit {
    owner: NameType;
    amount: AssetType;
}

export interface REXBuy {
    from: NameType;
    amount: AssetType;
}

export interface REXWithdraw {
    owner: NameType;
    rex: AssetType;
}