import type { Readable } from "svelte/store"
import { derived, get } from "svelte/store"
import { Asset } from '@wharfkit/antelope'

import { activeSession, currentAccount } from "./auth"
import type { Session } from "@wharfkit/session"
import { systemTokenKey } from "./tokens"

//fixme: kurt    staked, rex and other balances, how to cal
export interface Balance {
    chainId: string
    quantity: Asset
    tokenKey: string
}

export const balances: Readable<Balance[]> = derived(
    [activeSession, currentAccount],
    ([$activeSession, $currentAccount], set) => {
        const records = []

        // Push any core balance information in from the current account
        if ($activeSession && $currentAccount) {
            let coreBalance = $currentAccount.data.core_liquid_balance
            if (!coreBalance) {
                coreBalance = Asset.from(0, $currentAccount.systemToken)
            }
            records.push(createBalanceFromCoreToken($activeSession, coreBalance))
        }

        // let newBalances = $balancesProvider.balances
        // if ($activeSession) {
        //     const coreToken = createTokenFromChainId($activeSession.chainId)
        //     newBalances = newBalances.filter((x) => x.tokenKey !== coreToken.key)
        // }
        // // Push balances in as received by the balance provider
        // records.push(...newBalances)

        set(records)
    },
    new Array<Balance>()
)


export function createBalanceFromCoreToken(session: Session, balance: Asset): Balance {
    return {
        chainId: String(session.chain.id),
        quantity: balance,
        tokenKey: get(systemTokenKey)
    }

}
