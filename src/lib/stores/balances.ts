import type { AccountName } from '@wharfkit/signing-request'
import type { ChainId } from '@wharfkit/signing-request'
import type { LinkSession } from '$lib/anchor-link/link-session'
import { Asset, Name } from '@wharfkit/antelope'
import { derived } from 'svelte/store'
import type { Readable } from 'svelte/store'

import { createTokenFromChainId, makeTokenKey } from '$lib/stores/tokens'
import type { Token } from '$lib/stores/tokens'

import { activeBlockchain, activeSession, currentAccount } from '$lib/app/store'
import { balancesProvider, updateBalances } from '$lib/stores/balances-provider'
import { updateAccount } from './account-provider'

export interface Balance {
    key: string
    chainId: ChainId
    account: Name
    tokenKey: string
    quantity: Asset
    contract: Name
}

const initialBalances: Balance[] = []


export const balances: Readable<Balance[]> = derived(
    [activeSession, activeBlockchain, balancesProvider, currentAccount],
    ([$activeSession, $activeBlockchain, $balancesProvider, $currentAccount], set) => {
        const records = []

        // Push any core balance information in from the current account
        if ($activeSession && $currentAccount) {
            let coreBalance = $currentAccount.core_liquid_balance
            if (!coreBalance) {
                coreBalance = Asset.from(0, $activeBlockchain.coreTokenSymbol)
            }
            records.push(createBalanceFromCoreToken($activeSession, coreBalance))
        }

        let newBalances = $balancesProvider.balances
        if ($activeSession) {
            const coreToken = createTokenFromChainId($activeSession.chainId)
            newBalances = newBalances.filter((x) => x.tokenKey !== coreToken.key)
        }
        // Push balances in as received by the balance provider
        records.push(...newBalances)

        set(records)
    },
    initialBalances
)

// balances.subscribe(value => {
//     console.log("subscribe=========>balances:", value)
// })


export function createBalanceFromCoreToken(session: LinkSession, balance: Asset): Balance {
    const token = createTokenFromChainId(session.chainId)
    return createBalanceFromToken(session, token, balance)
}

export function createBalanceFromToken(
    session: LinkSession,
    token: Token,
    balance: Asset
): Balance {
    const key = makeBalanceKey(token, session.auth.actor)
    const record: Balance = {
        key,
        chainId: session.chainId,
        account: session.auth.actor,
        tokenKey: makeTokenKey(token),
        quantity: balance,
        contract: Name.from(token.contract),
    }
    return record
}

export function makeBalanceKey(token: Token, account: AccountName): string {
    return [
        String(token.chainId),
        String(token.contract),
        String(token.symbol.name),
        String(account),
    ]
        .join('-')
        .toLowerCase()
}

export async function fetchBalances(session: LinkSession | undefined, refresh = false) {
    if (session) {
        // Refresh the sessions account data
        updateAccount(session.auth.actor, session.chainId, refresh)
        // Refresh balances from the balance provider
        updateBalances(session)
    }
}