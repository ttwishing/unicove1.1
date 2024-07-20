import { ChainId } from '@wharfkit/signing-request'
import type { ABIDef, API, Name } from '@wharfkit/antelope'

import { APIClient } from '@wharfkit/antelope'
import type { AbiProvider, ChainIdType } from '@wharfkit/signing-request'


export type LinkChainType = LinkChain | ChainIdType | number

export class LinkChain implements AbiProvider {
    /** EOSIO ChainID for which requests are valid. */
    public chainId: ChainId
    /** API client instance used to communicate with the chain. */
    public client: APIClient

    private abiCache = new Map<string, ABIDef>()
    private pendingAbis = new Map<string, Promise<API.v1.GetAbiResponse>>()

    /** @internal */
    constructor(chainId: ChainIdType, clientOrUrl: APIClient | string) {
        this.chainId = ChainId.from(chainId)
        this.client =
            typeof clientOrUrl === 'string' ? new APIClient({ url: clientOrUrl }) : clientOrUrl
    }

    /**
     * Fetch the ABI for given account, cached.
     * @internal
     */
    public async getAbi(account: Name) {
        const key = String(account)
        let rv = this.abiCache.get(key)
        if (!rv) {
            let getAbi = this.pendingAbis.get(key)
            if (!getAbi) {
                getAbi = this.client.v1.chain.get_abi(account)
                this.pendingAbis.set(key, getAbi)
            }
            rv = (await getAbi).abi
            this.pendingAbis.delete(key)
            if (rv) {
                this.abiCache.set(key, rv)
            }
        }
        return rv as ABIDef
    }
}