import type { Readable } from "svelte/motion"
import { derived } from "svelte/store"
import { currentAccount } from "../store"
import { wharf } from "../wharf"
import { Name } from "@wharfkit/antelope"
import type { NameType } from "@wharfkit/antelope"
import { Asset } from "@wharfkit/antelope"

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

export const systemToken: Readable<Token | undefined> = derived([currentAccount, wharf],
    ([$currentAccount, $wharf]) => {
        if ($currentAccount && $wharf) {
            const token = {
                chainId: $wharf.chainId,
                contract: $currentAccount.token.contract.account,
                name: $currentAccount.systemToken.name,
                symbol: $currentAccount.systemToken
            }
            const record = {
                ...token,
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

export interface TokenKeyParams {
    chainId: string
    contract: Name
    name: string
}