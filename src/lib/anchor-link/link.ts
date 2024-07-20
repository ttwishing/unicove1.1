import {
    Signature,
    PermissionLevel,
    SignedTransaction,
    Bytes,
    PrivateKey,
    Name,
    API,
    Serializer,
    Transaction
} from '@wharfkit/antelope'

import type {
    NameType,
    PermissionLevelType,
    ABISerializable,
    AnyAction,
    AnyTransaction
} from '@wharfkit/antelope'

import {
    ChainId,
    ResolvedSigningRequest,
    PlaceholderName,
    PlaceholderPermission,
    IdentityProof,
    SigningRequest,
} from '@wharfkit/signing-request'

import type {
    CallbackPayload,
    ChainIdType,
    SigningRequestCreateArguments,
    ResolvedTransaction
} from '@wharfkit/signing-request'

import type { LinkStorage } from './link-storage'
import type { LinkOptions } from './link-options'
import type { LinkTransport } from './link-transport'
import { LinkChain } from './link-chain'
import type { LinkChainType } from './link-chain'
import { LinkSession } from './link-session'
import type { LinkCallback } from './link-callback'


export class Link {

    static version: string = '__ver'

    public readonly storage?: LinkStorage
    public readonly chains: LinkChain[]
    public readonly transport: LinkTransport

    constructor(options: LinkOptions) {
        if (typeof options !== 'object') {
            throw new TypeError('Missing options object')
        }
        if (!options.transport) {
            throw new TypeError('options.transport is required')
        }
        let chains = options.chains || []
        if (options.chainId && options.client) {
            if (options.chains.length > 0) {
                throw new TypeError(
                    'options.chainId and options.client are deprecated and cannot be used together with options.chains'
                )
            }
            chains = [{ chainId: options.chainId, nodeUrl: options.client }]
        }
        if (chains.length === 0) {
            throw new TypeError('options.chains is required')
        }
        this.chains = chains.map((chain) => {
            if (chain instanceof LinkChain) {
                return chain
            }
            if (!chain.chainId) {
                throw new TypeError('options.chains[].chainId is required')
            }
            if (!chain.nodeUrl) {
                throw new TypeError('options.chains[].nodeUrl is required')
            }
            return new LinkChain(chain.chainId, chain.nodeUrl)
        })
        // if (options.service === undefined || typeof options.service === 'string') {
        //     this.callbackService = new BuoyCallbackService(
        //         options.service || LinkOptions.defaults.service
        //     )
        // } else {
        //     this.callbackService = options.service
        // }
        this.transport = options.transport
        //fixme: kurt, why check "options.storage !== null" ?
        if (options.storage !== null) {
            this.storage = options.storage || this.transport.storage
        }
        // this.verifyProofs =
        //     options.verifyProofs !== undefined
        //         ? options.verifyProofs
        //         : LinkOptions.defaults.verifyProofs
        // this.encodeChainIds =
        //     options.encodeChainIds !== undefined
        //         ? options.encodeChainIds
        //         : LinkOptions.defaults.encodeChainIds
    }

    public async listSessions(identifier: NameType) {
        if (!this.storage) {
            throw new Error('Unable to list sessions: No storage adapter configured')
        }

        const key = this.sessionKey(identifier, 'list')
        let list: { auth: PermissionLevelType; chainId: ChainIdType }[]
        try {
            list = JSON.parse((await this.storage.read(key)) || '[]')
        } catch (error: any) {
            throw new Error(`Unable to list sessions: ${error.message || String(error)}`)
        }

        return list.map(({ auth, chainId }) => ({
            auth: PermissionLevel.from(auth),
            chainId: ChainId.from(chainId),
        }))
    }

    public async restoreSession(
        identifier: NameType,
        auth?: PermissionLevelType,
        chainId?: ChainIdType
    ) {
        if (!this.storage) {
            throw new Error('Unable to restore session: No storage adapter configured')
        }
        let key: string
        if (auth && chainId) {
            // both auth and chain id given, we can look up on specific key
            key = this.sessionKey(
                identifier,
                formatAuth(PermissionLevel.from(auth)),
                String(ChainId.from(chainId))
            )
        } else {
            // otherwise we use the session list to filter down to most recently used matching given params
            let list = await this.listSessions(identifier)
            if (auth) {
                list = list.filter((item) => item.auth.equals(auth))
            }
            if (chainId) {
                const id = ChainId.from(chainId)
                list = list.filter((item) => item.chainId.equals(id))
            }
            const latest = list[0]
            if (!latest) {
                return null
            }
            key = this.sessionKey(identifier, formatAuth(latest.auth), String(latest.chainId))
        }
        const data = await this.storage.read(key)
        if (!data) {
            return null
        }
        let sessionData: any
        try {
            sessionData = JSON.parse(data)
        } catch (error: any) {
            throw new Error(
                `Unable to restore session: Stored JSON invalid (${error.message || String(error)})`
            )
        }
        const session = LinkSession.restore(this, sessionData)
        if (auth || chainId) {
            // update latest used
            await this.touchSession(identifier, session.auth, session.chainId)
        }
        return session
    }

    private async touchSession(
        identifier: NameType,
        auth: PermissionLevel,
        chainId: ChainId,
        remove = false
    ) {
        const list = await this.listSessions(identifier)
        const existing = list.findIndex(
            (item) => item.auth.equals(auth) && item.chainId.equals(chainId)
        )
        if (existing >= 0) {
            list.splice(existing, 1)
        }
        if (remove === false) {
            list.unshift({ auth, chainId })
        }
        const key = this.sessionKey(identifier, 'list')
        await this.storage!.write(key, JSON.stringify(list))
    }

    public async removeSession(identifier: NameType, auth: PermissionLevel, chainId: ChainId) {
        if (!this.storage) {
            throw new Error('Unable to remove session: No storage adapter configured')
        }
        const key = this.sessionKey(identifier, formatAuth(auth), String(chainId))
        await this.storage.remove(key)
        await this.touchSession(identifier, auth, chainId, true)
    }

    public getChain(chain: LinkChainType) {
        if (chain instanceof LinkChain) {
            return chain
        }
        if (typeof chain === 'number') {
            const rv = this.chains[chain]
            if (!rv) {
                throw new Error(`Invalid chain index: ${chain}`)
            }
            return rv
        }
        const id = ChainId.from(chain)
        const rv = this.chains.find((c) => c.chainId.equals(id))
        if (!rv) {
            throw new Error(`Unsupported chain: ${id}`)
        }
        return rv
    }

    private sessionKey(identifier: NameType, ...suffix: string[]) {
        return [String(Name.from(identifier)), ...suffix].join('-')
    }

    /**
  * Return user agent of this link.
  * @internal
  */
    getUserAgent() {
        let rv = `AnchorLink/${Link.version}`
        if (this.transport.userAgent) {
            rv += ' ' + this.transport.userAgent()
        }
        return rv
    }

    //==============
    public makeSignatureProvider(
        availableKeys: string[],
        chain?: LinkChainType,
        transport?: LinkTransport
    ): any {
        return {

        }
    }

    /**
     * Sign and optionally broadcast a EOSIO transaction, action or actions.
     *
     * Example:
     *
     * ```ts
     * let result = await myLink.transact({transaction: myTx})
     * ```
     *
     * @param args The action, actions or transaction to use.
     * @param options Options for this transact call.
     * @param transport Transport override, for internal use.
     */
    public async transact(
        args: TransactArgs,
        options?: TransactOptions,
        transport?: LinkTransport
    ): Promise<TransactResult> {
        return new Promise<TransactResult>((resolve, reject) => {

        })
    }

    public async createRequest(
        args: SigningRequestCreateArguments,
        chain?: LinkChain,
        transport?: LinkTransport
    ) {


    }

    public async sendRequest(
        request: SigningRequest,
        callback: LinkCallback,
        chain?: LinkChain,
        transport?: LinkTransport,
        broadcast = false
    ) {

    }


}

export interface TransactResult {
    /** The resolved signing request. */
    resolved: ResolvedSigningRequest
    /** The chain that was used. */
    chain: LinkChain
    /** The transaction signatures. */
    signatures: Signature[]
    /** The callback payload. */
    payload: CallbackPayload
    /** The signer authority. */
    signer: PermissionLevel
    /** The resulting transaction. */
    transaction: Transaction
    /** Resolved version of transaction, with the action data decoded. */
    resolvedTransaction: ResolvedTransaction
    /** Push transaction response from api node, only present if transaction was broadcast. */
    processed?: { [key: string]: any }
}

export interface TransactArgs {
    /** Full transaction to sign. */
    transaction?: AnyTransaction
    /** Action to sign. */
    action?: AnyAction
    /** Actions to sign. */
    actions?: AnyAction[]
}

export interface TransactOptions {
    /**
     * Whether to broadcast the transaction or just return the signature.
     * Defaults to true.
     */
    broadcast?: boolean
    /**
     * Chain to use when configured with multiple chains.
     */
    chain?: LinkChainType
    /**
     * Whether the signer can make modifications to the request
     * (e.g. applying a cosigner action to pay for resources).
     *
     * Defaults to false if [[broadcast]] is true or unspecified; otherwise true.
     */
    noModify?: boolean
}

export interface TransactResult {
    /** The resolved signing request. */
    resolved: ResolvedSigningRequest
    /** The chain that was used. */
    chain: LinkChain
    /** The transaction signatures. */
    signatures: Signature[]
    /** The callback payload. */
    payload: CallbackPayload
    /** The signer authority. */
    signer: PermissionLevel
    /** The resulting transaction. */
    transaction: Transaction
    /** Resolved version of transaction, with the action data decoded. */
    resolvedTransaction: ResolvedTransaction
    /** Push transaction response from api node, only present if transaction was broadcast. */
    processed?: { [key: string]: any }
}


function formatAuth(auth: PermissionLevelType): string {
    const a = PermissionLevel.from(auth)
    const actor = a.actor.equals(PlaceholderName) ? '<any>' : String(a.actor)
    let permission: string
    if (a.permission.equals(PlaceholderName) || a.permission.equals(PlaceholderPermission)) {
        permission = '<any>'
    } else {
        permission = String(a.permission)
    }
    return `${actor}@${permission}`
}