import { Asset } from '@wharfkit/antelope'
import { LinkSession } from '$lib/anchor-link/link-session'
import { Name } from '@wharfkit/antelope'
import { get, writable } from 'svelte/store'
import type { Writable } from 'svelte/store'


import { chainConfig } from '$lib/app/config'
import { activeEvmSession, activeSession, evmBalance, waitForStoreValue } from '$lib/app/store'
import type { Balance } from '$lib/stores/balances'
import { getBalanceProvider } from '$lib/balance-providers/utils'
import { makeTokenKey } from './tokens'

export const isLoading: Writable<boolean> = writable(false)

interface BalancesProvider {
    balances: Balance[]
}

const initialBalances: BalancesProvider = {
    balances: [],
}

export const balancesProvider: Writable<BalancesProvider> = writable(initialBalances, () => {
    // Update on a set interval
    const interval = setInterval(() => {
        const session = get(activeSession)
        if (session) {
            updateBalances(session)
        }
    }, 30000)

    // Subscribe to changes to the active session and update on change
    const unsubscribe = activeSession.subscribe((session) => {
        if (session) {
            updateBalances(session)
        }
    })

    return () => {
        unsubscribe()
        clearInterval(interval)
    }
})

export async function updateBalances(session: LinkSession) {
    isLoading.set(true)
    const chain = chainConfig(session.chainId)
    if (chain.balanceProviders) {
        for (const p of chain.balanceProviders) {
            const provider = getBalanceProvider(p, chain)
            if (provider) {
                const balances = await provider.fetchBalances(session.auth.actor)
                // Fetch evm balances when applicable
                const evmSession = get(activeEvmSession)
                if (evmSession) {
                    const evmBalances = await evmSession.getBalances()

                    if (evmBalances.length > 0) {
                        evmBalances.forEach((balance) => {
                            const contract = Name.from('eosio.evm')
                            const tokenKey = makeTokenKey({
                                chainId: session.chainId,
                                contract,
                                name: `${String(balance.symbol.code).toLowerCase()}-evm`,
                            })

                            balances.push({
                                key: `${tokenKey}-balance`,
                                chainId: session.chainId,
                                contract: contract,
                                account: session.auth.actor,
                                tokenKey,
                                quantity: balance,
                            })
                        })
                    } else {
                        // If no balances are returned, try again in 3 seconds
                        setTimeout(() => {
                            updateBalances(session)
                        }, 3000)
                    }
                }

                balancesProvider.set({
                    balances: balances,
                })
                break
            }
        }
    }
    isLoading.set(false)
}

export async function updateEvmBalance() {
    const evmSession = await waitForStoreValue(activeEvmSession)

    if (evmSession) {
        const balance = await evmSession.getBalance()
        evmBalance.set(Asset.from(balance))
    }
}
