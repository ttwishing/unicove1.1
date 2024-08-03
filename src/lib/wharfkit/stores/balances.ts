import type { Readable } from "svelte/store"
import { derived, readable } from "svelte/store"
import { Asset } from '@wharfkit/antelope'

import { activeSession, currentAccount } from "../store"

//fixme:kurt, how to handle balanceProviders.
export const balances: Readable<Balance[]> = readable([])

export const coreTokenBalance: Readable<Balance | undefined> = derived(
    [currentAccount],
    ([$currentAccount], set) => {
        let coreBalance: Asset | undefined = undefined
        if ($currentAccount) {
            coreBalance = $currentAccount.data.core_liquid_balance
            if (!coreBalance) {
                coreBalance = Asset.from(0, $currentAccount.systemToken)
            }
            set({ quantity: coreBalance })
        }
    }
)

export interface Balance {
    quantity: Asset
}

