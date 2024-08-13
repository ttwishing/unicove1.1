import { derived } from "svelte/store"
import { currentAccount } from "./store"
import { wharf, WharfService } from "./wharf"
import { Name } from "@wharfkit/antelope"
import type { NameType } from "@wharfkit/antelope"
import { Asset } from "@wharfkit/antelope"

import type { Readable, Writable } from "svelte/store"
import { writable } from "svelte/store"
import { balances } from "./stores/balance-provider"
import { loadPriceTicker } from "./stores/balance-provider"
import type { Balance } from "./stores/balance-provider"

export const systemToken: Readable<Token | undefined> = derived([currentAccount, wharf],
    ([$currentAccount, $wharf]) => {
        if ($currentAccount && $wharf) {
            const token = {
                chainId: $wharf.chainId,
                contract: $currentAccount.token.contract.account,
                name: $currentAccount.systemToken.name,
            }
            const record = {
                ...token,
                symbol: $currentAccount.systemToken,
                key: makeTokenKey(token),
            }
            return record
        }
        return undefined
    })

export const systemTokenKey: Readable<string> = derived([currentAccount, wharf],
    ([$account, $wharf]) => {
        if ($account && $wharf) {
            const params: TokenKeyParams = {
                chainId: $wharf.chainId,
                contract: $account.token.contract.account,
                name: $account.systemToken.name,
            }
            const result = makeTokenKey(params)
            return result;
        }
        return ''
    })

export function makeTokenKey(token: TokenKeyParams): string {
    return [token.chainId, String(token.contract), token.name]
        .join('-')
        .replace(/[()]/g, '')
        .replace(/\s/g, '-')
        .toLowerCase()
}

export interface Token {
    key: string
    chainId: string
    contract: NameType
    symbol: Asset.Symbol
    name: NameType
    price?: number
    logo?: string
    balance?: Asset | string
    evm?: boolean
}


export interface TokenKeyParams {
    chainId: string
    contract: Name
    name: string
}
