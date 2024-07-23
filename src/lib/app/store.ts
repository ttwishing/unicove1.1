import { derived, writable } from 'svelte/store'
import type { Readable } from 'svelte/store'

import { LinkSession } from '$lib/anchor-link/link-session'
import { Asset } from '@wharfkit/antelope'
import type { SessionLike } from './auth'
import { Preferences } from './preferences'
import { accountProvider } from '$lib/stores/account-provider'
import { chainConfig, chains } from './config'
import type { ChainConfig } from './config'
import type { EvmSession } from '$lib/evm'
import { priceTicker } from './price-ticker'

export const preferences = Preferences.shared

export const appReady = writable<boolean>(false)

export const activeSession = writable<LinkSession | undefined>(undefined)
export const availableSessions = writable<SessionLike[]>([])

/** Active EVM session, aka logged in user. */
export const activeEvmSession = writable<EvmSession | undefined>(undefined)

/** EVM session balance */
export const evmBalance = writable<Asset | undefined>(undefined)

export const activeBlockchain: Readable<ChainConfig> = derived(activeSession, (session) => {
    if (session) {
        return chainConfig(session.chainId)
    } else {
        return chains[0]
    }
})

export const currentAccount = derived(
    accountProvider,
    ($accountProvider) => $accountProvider.account
)

/** Active price ticker for the currently selected blockchain */
export const activePriceTicker: Readable<number> = derived(
    [activeBlockchain],
    ([$activeBlockchain], set) =>
        priceTicker($activeBlockchain).value.subscribe((v) => {
            if (v !== undefined) {
                set(v)
            }
        })
)

export const waitForStoreValue = <StoreType>(
    store: Readable<StoreType | undefined>
): Promise<StoreType> => {
    let unsubscribe: (() => void) | undefined
    return new Promise((resolve) => {
        unsubscribe = store.subscribe((value) => {
            if (value) {
                // Replace this condition with whatever means "populated" for you
                resolve(value)
                unsubscribe && unsubscribe()
            }
        })
    })
}

