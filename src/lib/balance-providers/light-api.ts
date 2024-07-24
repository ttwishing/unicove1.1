import { Asset, Name } from '@wharfkit/antelope'

import type { ChainConfig } from '$lib/app/config'
import { makeTokenKey } from '$lib/stores/tokens'
import type { Token } from '$lib/stores/tokens'
import { makeBalanceKey } from '$lib/stores/balances'
import type { Balance } from '$lib/stores/balances'

import type { BalanceProvider } from './types'

interface RawTokenBalance {
    currency: string
    amount: string
    decimals: number
    contract: string
}

export class LightAPIProvider implements BalanceProvider {
    chain: ChainConfig

    constructor(chain: ChainConfig) {
        this.chain = chain
    }

    async fetchBalances(account: Name): Promise<Balance[]> {
        const data = await this.fetchData(account)
        const balances = this.parseTokenBalances(account, data)
        return balances
    }

    async fetchData(account: Name) {
        //Example: https://eos.light-api.net/api/account/eos/teamgreymass
        const apiUrl = `https://balances.unicove.com/api/balances/${this.chain.id}/${account}`

        return await fetch(apiUrl)
            .then(async (response) => {
                const jsonBody =
                    response &&
                    (await response.json().catch((error) => {
                        console.warn(
                            'An error occured while parsing the token balances response body:',
                            {
                                error,
                            }
                        )
                    }))
                return jsonBody.balances
            })
            .catch((error) => {
                console.warn('An error occured while fetching token balances:', { error })
                return []
            })
    }

    parseTokenBalances(account: Name, balances: RawTokenBalance[]) {
        return balances
            .filter((balance) => {
                return balance.amount && Number(balance.amount) !== 0
            })
            .map((balance) => {
                const symbol: Asset.Symbol = Asset.Symbol.from(
                    `${balance.decimals},${balance.currency}`
                )
                const token = this.parseTokenInfo(balance)
                const amount = balance.amount ? Number(balance.amount) : 0
                const asset = Asset.from(amount, symbol)
                const key = makeBalanceKey(token, account)
                const record: Balance = {
                    key,
                    chainId: this.chain.chainId,
                    account: account,
                    contract: Name.from(balance.contract),
                    tokenKey: token.key,
                    quantity: asset,
                }
                return record
            })
            .filter((balance) => !!balance)
    }

    parseTokenInfo(balance: RawTokenBalance): Token {
        const symbol: Asset.Symbol = Asset.Symbol.from(`${balance.decimals},${balance.currency}`)
        const key = makeTokenKey({
            chainId: this.chain.chainId,
            contract: balance.contract,
            name: symbol.name,
        })
        return {
            key,
            chainId: this.chain.chainId,
            contract: balance.contract,
            symbol: symbol,
            name: symbol.name,
        }
    }
}
