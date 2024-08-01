import type { Readable } from "svelte/motion"
import { derived } from "svelte/store"
import { Asset } from '@wharfkit/antelope'

import { currentAccount } from "./auth"

//fixme: kurt    staked, rex and other balances, how to cal


/**
 * when switch account
 * 
 * balanceTokens must be corresponds to the current account
 */
export const balanceTokens: Readable<Asset | undefined> = derived(
    [currentAccount],
    ([$currentAccount]) => {
        if ($currentAccount) {
            let coreBalance = $currentAccount.data.core_liquid_balance
            if (!coreBalance) {
                coreBalance = Asset.from(0, $currentAccount.systemToken)
            }
            return coreBalance
        }
        return undefined
    },
);