import type { Readable } from "svelte/motion"
import { derived } from "svelte/store"
import { activeSession, currentAccount } from "../store"
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

export const systemToken: Readable<Token | undefined> = derived([currentAccount, activeSession],
    ([$currentAccount, $activeSession]) => {
        if ($currentAccount && $activeSession) {
            const token = {
                chainId: String($activeSession.chain.id),
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

export const systemTokenKey: Readable<string> = derived([currentAccount, activeSession],
    ([$account, $activeSession]) => {
        if ($account && $activeSession) {
            const params: TokenKeyParams = {
                chainId: String($activeSession.chain.id),
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