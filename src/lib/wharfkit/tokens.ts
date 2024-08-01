import type { Readable } from "svelte/motion"
import { derived } from "svelte/store"
import { activeSession, currentAccount } from "./auth"
import { Name } from "@wharfkit/antelope"

export const systemTokenKey: Readable<string> = derived([currentAccount, activeSession],
    ([$currentAccount, $activeSession]) => {
        if ($currentAccount && $activeSession) {
            const params: TokenKeyParams = {
                chainId: String($activeSession.chain.id),
                contract: $currentAccount.token.contract.account,
                name: $currentAccount.systemToken.name,
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