import zlib from 'pako'

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
    AnyTransaction,
    PublicKey
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
import { LinkOptions } from './link-options'
import type { LinkTransport } from './link-transport'
import type { LinkCallback, LinkCallbackService } from './link-callback'
import { BuoyCallbackService } from './link-callback'

import { LinkChannelSession, LinkFallbackSession, LinkSession } from './link-session'
import { CancelError, IdentityError } from './errors'

import { LinkCreate } from './link-types'

import { sessionMetadata } from './utils'

/**
 * Payload accepted by the [[Link.transact]] method.
 * Note that one of `action`, `actions` or `transaction` must be set.
 */
export interface TransactArgs {
    /** Full transaction to sign. */
    transaction?: AnyTransaction
    /** Action to sign. */
    action?: AnyAction
    /** Actions to sign. */
    actions?: AnyAction[]
}

/**
 * Options for the [[Link.transact]] method.
 */
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

/**
 * The result of a [[Link.transact]] call.
 */
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

/**
 * The result of a [[Link.identify]] call.
 */
export interface IdentifyResult extends TransactResult {
    /** The identified account, not present unless [[LinkOptions.verifyProofs]] is set to true. */
    account?: API.v1.AccountObject
    /** The identity proof. */
    proof: IdentityProof
}

/**
 * The result of a [[Link.login]] call.
 */
export interface LoginResult extends IdentifyResult {
    /** The session created by the login. */
    session: LinkSession
}

/**
 * Link chain, can be a [[LinkChain]] instance, a chain id or a index in [[Link.chains]].
 * @internal
 */
export type LinkChainType = LinkChain | ChainIdType | number

/**
 * Class representing a EOSIO chain.
 */
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

/**
 * Anchor Link main class.
 *
 * @example
 *
 * ```ts
 * import AnchorLink from 'anchor-link'
 * import ConsoleTransport from 'anchor-link-console-transport'
 *
 * const link = new AnchorLink({
 *     transport: new ConsoleTransport(),
 *     chains: [
 *         {
 *             chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
 *             nodeUrl: 'https://eos.greymass.com',
 *         },
 *     ],
 * })
 *
 * const result = await link.transact({actions: myActions})
 * ```
 */
export class Link {
    /** Package version. */
    static version: string = '__ver' // eslint-disable-line @typescript-eslint/no-inferrable-types

    /** Chains this instance is configured with. */
    public readonly chains: LinkChain[]
    /** Transport used to deliver requests to the users wallet. */
    public readonly transport: LinkTransport
    /** Storage adapter used to persist sessions. */
    public readonly storage?: LinkStorage

    private callbackService: LinkCallbackService
    private verifyProofs: boolean
    private encodeChainIds: boolean

    /** Create a new link instance. */
    constructor(options: LinkOptions) {
        console.log("link.ts========================constructor")
        if (typeof options !== 'object') {
            throw new TypeError('Missing options object')
        }
        if (!options.transport) {
            throw new TypeError('options.transport is required')
        }
        let chains = options.chains || []
        console.log("chains = ", chains)
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
        console.log("this.chains = ", this.chains)

        console.log("service = ", options.service)
        if (options.service === undefined || typeof options.service === 'string') {
            this.callbackService = new BuoyCallbackService(
                options.service || LinkOptions.defaults.service
            )
        } else {
            this.callbackService = options.service
        }
        console.log("this.callbackService = ", this.callbackService)
        this.transport = options.transport
        console.log("this.transport = ", this.transport)
        console.log("storage = ", options.storage)
        console.log("this.transport.storage = ", this.transport.storage)
        if (options.storage !== null) {
            this.storage = options.storage || this.transport.storage
        }
        console.log("this.storage = ", this.storage)
        this.verifyProofs =
            options.verifyProofs !== undefined
                ? options.verifyProofs
                : LinkOptions.defaults.verifyProofs
        console.log("this.verifyProofs = ", this.verifyProofs)
        this.encodeChainIds =
            options.encodeChainIds !== undefined
                ? options.encodeChainIds
                : LinkOptions.defaults.encodeChainIds
        console.log("this.encodeChainIds = ", this.encodeChainIds)
        console.log("link.ts========================constructor#finish")
    }

    /**
     * The APIClient instance for communicating with the node.
     * @note This returns the first APIClient when link is configured with multiple chains.
     */
    public get client() {
        return this.chains[0].client
    }

    /**
     * Return a [[LinkChain]] object for given chainId or chain reference.
     * @throws If this link instance has no configured chain for given reference.
     * @internal
     */
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

    /**
     * Create a SigningRequest instance configured for this link.
     * @internal
     */
    public async createRequest(
        args: SigningRequestCreateArguments,
        chain?: LinkChain,
        transport?: LinkTransport
    ) {
        console.log("link.ts===================createRequest")
        //登录场景：chain, transport参数都为空. this.transport：BrowserTransport
        const t = transport || this.transport
        let request: SigningRequest
        if (chain || this.chains.length === 1) {
            console.log("sinlge-chain")
            const c = chain || this.chains[0]
            request = await SigningRequest.create(
                {
                    ...args,
                    chainId: c.chainId,
                    broadcast: false,
                },
                { abiProvider: c, zlib }
            )
        } else {
            console.log("multi-chain")
            // multi-chain request
            const requestArgs = {
                ...args,
                chainId: null,
                chainIds: this.encodeChainIds ? this.chains.map((c) => c.chainId) : undefined,
                broadcast: false,
            }
            // abi's will be pulled from the first chain and assumed to be identical on all chains
            const requestOptions = { abiProvider: this.chains[0], zlib }
            console.log("requestArgs", requestArgs)
            console.log("requestOptions", requestOptions)
            request = await SigningRequest.create(requestArgs, requestOptions)
        }
        if (t.prepare) {
            request = await t.prepare(request)
        }
        const callback = this.callbackService.create()
        request.setCallback(callback.url, true)
        return { request, callback }
    }

    /**
     * Send a SigningRequest instance using this link.
     * @internal
     */
    public async sendRequest(
        request: SigningRequest,
        callback: LinkCallback,
        chain?: LinkChain,
        transport?: LinkTransport,
        broadcast = false
    ) {
        console.log("link.ts===================sendRequest")
        //登录场景:chain, transport, broadcast空
        const t = transport || this.transport
        try {
            const linkUrl = request.data.callback
            console.log("linkUrl = ", linkUrl)
            if (linkUrl !== callback.url) {
                throw new Error('Invalid request callback')
            }
            if (request.data.flags.broadcast === true || request.data.flags.background === false) {
                throw new Error('Invalid request flags')
            }

            // wait for callback or user cancel
            let done = false
            console.log("sendRequest-first: ", t)
            const cancel = new Promise<never>((resolve, reject) => {
                console.log("sendRequest-first: start...")
                t.onRequest(request, (reason) => {
                    console.log("sendRequest-first cancelled")
                    if (done) {
                        // ignore any cancel calls once callbackResponse below has resolved
                        return
                    }
                    const error = typeof reason === 'string' ? new CancelError(reason) : reason
                    if (t.recoverError && t.recoverError(error, request) === true) {
                        // transport was able to recover from the error
                        return
                    }
                    callback.cancel()
                    reject(error)
                })
            })
            // 发送请求，待app端签名；callback建立websocket, 待app端返回信息, 通信完成后关闭socket
            // trace: callback.wait任务返回app回应；cancel任务无响应，除非取消，取消执行reject后，进入异常处理
            const callbackResponse = await Promise.race([callback.wait(), cancel])
            console.log("callbackResponse = ", callbackResponse)
            done = true
            if (typeof callbackResponse.rejected === 'string') {
                throw new CancelError(callbackResponse.rejected)
            }
            const payload = callbackResponse as CallbackPayload
            const signer = PermissionLevel.from({
                actor: payload.sa, //账号
                permission: payload.sp, //权限
            })
            console.log("signer = ", signer)
            const signatures: Signature[] = Object.keys(payload)
                .filter((key) => key.startsWith('sig') && key !== 'sig0')
                .map((key) => Signature.from(payload[key]!))
            console.log("signatures = ", signatures)
            let c: LinkChain
            if (!chain && this.chains.length > 1) {
                if (!payload.cid) {
                    throw new Error(
                        'Multi chain response payload must specify resolved chain id (cid)'
                    )
                }
                c = this.getChain(payload.cid) //链路id, 比如我是用jungle4登录的
                console.log("chain_0 = ", c)
            } else {
                c = chain || this.getChain(0)
                if (payload.cid && !c.chainId.equals(payload.cid)) {
                    throw new Error('Got response for wrong chain id')
                }
                console.log("chain_1 = ", c)
            }
            // recreate transaction from request response
            const resolved = await ResolvedSigningRequest.fromPayload(payload, {
                zlib,
                abiProvider: c,
            })
            console.log("resolved = ", resolved)
            // prepend cosigner signature if present
            const cosignerSig = resolved.request.getInfoKey('cosig', {
                type: Signature,
                array: true,
            }) as Signature[] | undefined
            console.log("cosignerSig = ", cosignerSig)
            if (cosignerSig) {
                signatures.unshift(...cosignerSig)
            }
            console.log("signatures = ", signatures)
            const result: TransactResult = {
                resolved,
                chain: c,
                transaction: resolved.transaction,
                resolvedTransaction: resolved.resolvedTransaction,
                signatures,
                payload,
                signer,
            }
            if (broadcast) {
                const signedTx = SignedTransaction.from({
                    ...resolved.transaction,
                    signatures,
                })
                const res = await c.client.v1.chain.push_transaction(signedTx)
                result.processed = res.processed
            }
            if (t.onSuccess) {
                t.onSuccess(request, result)
            }
            return result
        } catch (error) {
            console.log("error = ", error)
            if (t.onFailure) {
                t.onFailure(request, error)
            }
            throw error
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
        console.log("link=============================transact")
        console.log("args = ", args)
        console.log("options = ", options)
        console.log("transport = ", transport)

        const o = options || {}
        const t = transport || this.transport
        const c = o.chain !== undefined ? this.getChain(o.chain) : undefined
        const broadcast = o.broadcast !== false
        const noModify = o.noModify !== undefined ? o.noModify : !broadcast
        // Initialize the loading state of the transport
        if (t && t.showLoading) {
            console.log("showLoading")
            t.showLoading()
        }
        // eosjs transact compat: upgrade to transaction if args have any header fields
        const anyArgs = args as any
        if (
            args.actions &&
            (anyArgs.expiration ||
                anyArgs.ref_block_num ||
                anyArgs.ref_block_prefix ||
                anyArgs.max_net_usage_words ||
                anyArgs.max_cpu_usage_ms ||
                anyArgs.delay_sec)
        ) {
            args = {
                transaction: {
                    expiration: '1970-01-01T00:00:00',
                    ref_block_num: 0,
                    ref_block_prefix: 0,
                    max_net_usage_words: 0,
                    max_cpu_usage_ms: 0,
                    delay_sec: 0,
                    ...anyArgs,
                },
            }
        }
        console.log("args = ", args)
        console.log("c = ", c)
        console.log("t = ", t)
        console.log("broadcast = ", broadcast)
        console.log("noModify = ", noModify)
        const { request, callback } = await this.createRequest(args, c, t)
        console.log("request = ", request)
        console.log("callback = ", callback)
        if (noModify) {
            request.setInfoKey('no_modify', true, 'bool')
        }
        const result = await this.sendRequest(request, callback, c, t, broadcast)
        return result
    }

    /**
     * Send an identity request and verify the identity proof if [[LinkOptions.verifyProofs]] is true.
     * @param args.scope The scope of the identity request.
     * @param args.requestPermission Optional request permission if the request is for a specific account or permission.
     * @param args.info Metadata to add to the request.
     * @note This is for advanced use-cases, you probably want to use [[Link.login]] instead.
     */
    public async identify(args: {
        scope: NameType
        requestPermission?: PermissionLevelType
        info?: { [key: string]: ABISerializable | Bytes }
    }): Promise<IdentifyResult> {
        const { request, callback } = await this.createRequest({
            identity: { permission: args.requestPermission, scope: args.scope },
            info: args.info,
        })
        console.log("request = ", request)
        console.log("callback = ", callback)
        const res = await this.sendRequest(request, callback)
        console.log("sendRequest_result = ", res)
        if (!res.resolved.request.isIdentity()) {
            throw new IdentityError('Unexpected response')
        }

        let account: API.v1.AccountObject | undefined
        const proof = res.resolved.getIdentityProof(res.signatures[0])
        console.log("proof = ", proof)
        console.log("this.verifyProofs = ", this.verifyProofs)
        if (this.verifyProofs) {
            account = await res.chain.client.v1.chain.get_account(res.signer.actor)
            if (!account) {
                throw new IdentityError(`Signature from unknown account: ${proof.signer.actor}`)
            }
            const accountPermission = account.permissions.find(({ perm_name }) =>
                proof.signer.permission.equals(perm_name)
            )
            if (!accountPermission) {
                throw new IdentityError(
                    `${proof.signer.actor} signed for unknown permission: ${proof.signer.permission}`
                )
            }
            const proofValid = proof.verify(
                accountPermission.required_auth,
                account.head_block_time
            )
            if (!proofValid) {
                throw new IdentityError(`Invalid identify proof for: ${proof.signer}`)
            }
        }
        console.log("account = ", account)
        console.log("args.requestPermission = ", args.requestPermission)
        if (args.requestPermission) {
            const perm = PermissionLevel.from(args.requestPermission)
            if (
                (!perm.actor.equals(PlaceholderName) && !perm.actor.equals(proof.signer.actor)) ||
                (!perm.permission.equals(PlaceholderPermission) &&
                    !perm.permission.equals(proof.signer.permission))
            ) {
                throw new IdentityError(
                    `Identity proof singed by ${proof.signer}, expected: ${formatAuth(perm)} `
                )
            }
        }

        return {
            ...res,
            account,
            proof,
        }
    }

    /**
     * Login and create a persistent session.
     * @param identifier The session identifier, an EOSIO name (`[a-z1-5]{1,12}`).
     *                   Should be set to the contract account if applicable.
     */
    public async login(identifier: NameType): Promise<LoginResult> {
        console.log("link.ts======================login")
        const privateKey = PrivateKey.generate('K1')
        const requestKey = privateKey.toPublic()
        const createInfo = LinkCreate.from({
            session_name: identifier,
            request_key: requestKey,
            user_agent: this.getUserAgent(),
        })
        console.log("createInfo = ", createInfo)

        const res = await this.identify({
            scope: identifier,
            info: {
                link: createInfo,
                scope: identifier,
            },
        })
        console.log("identify_result = ", res)
        const metadata = sessionMetadata(res.payload, res.resolved.request)
        const signerKey = res.proof.recover()
        let session: LinkSession
        if (res.payload.link_ch && res.payload.link_key && res.payload.link_name) {
            session = new LinkChannelSession(
                this,
                {
                    identifier,
                    chainId: res.chain.chainId,
                    auth: res.signer,
                    publicKey: signerKey,
                    channel: {
                        url: res.payload.link_ch,
                        key: res.payload.link_key,
                        name: res.payload.link_name,
                    },
                    requestKey: privateKey,
                },
                metadata
            )
            console.log("session_0 = ", session)
        } else {
            session = new LinkFallbackSession(
                this,
                {
                    identifier,
                    chainId: res.chain.chainId,
                    auth: res.signer,
                    publicKey: signerKey,
                },
                metadata
            )
            console.log("session_1 = ", session)
        }
        await this.storeSession(session)
        return {
            ...res,
            session,
        }
    }

    /**
     * Restore previous session, use [[login]] to create a new session.
     * @param identifier The session identifier, must be same as what was used when creating the session with [[login]].
     * @param auth A specific session auth to restore, if omitted the most recently used session will be restored.
     * @param chainId If given function will only consider that specific chain when restoring session.
     * @returns A [[LinkSession]] instance or null if no session can be found.
     * @throws If no [[LinkStorage]] adapter is configured or there was an error retrieving the session data.
     **/
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
        } catch (error) {
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

    /**
     * List stored session auths for given identifier.
     * The most recently used session is at the top (index 0).
     * @throws If no [[LinkStorage]] adapter is configured or there was an error retrieving the session list.
     **/
    public async listSessions(identifier: NameType) {
        console.log("listSessions=========================")
        if (!this.storage) {
            throw new Error('Unable to list sessions: No storage adapter configured')
        }
        const key = this.sessionKey(identifier, 'list')
        let list: { auth: PermissionLevelType; chainId: ChainIdType }[]
        try {
            list = JSON.parse((await this.storage.read(key)) || '[]')
        } catch (error) {
            throw new Error(`Unable to list sessions: ${error.message || String(error)}`)
        }
        return list.map(({ auth, chainId }) => ({
            auth: PermissionLevel.from(auth),
            chainId: ChainId.from(chainId),
        }))
    }

    /**
     * Remove stored session for given identifier and auth.
     * @throws If no [[LinkStorage]] adapter is configured or there was an error removing the session data.
     */
    public async removeSession(identifier: NameType, auth: PermissionLevel, chainId: ChainId) {
        if (!this.storage) {
            throw new Error('Unable to remove session: No storage adapter configured')
        }
        const key = this.sessionKey(identifier, formatAuth(auth), String(chainId))
        await this.storage.remove(key)
        await this.touchSession(identifier, auth, chainId, true)
    }

    /**
     * Remove all stored sessions for given identifier.
     * @throws If no [[LinkStorage]] adapter is configured or there was an error removing the session data.
     */
    public async clearSessions(identifier: string) {
        if (!this.storage) {
            throw new Error('Unable to clear sessions: No storage adapter configured')
        }
        for (const { auth, chainId } of await this.listSessions(identifier)) {
            await this.removeSession(identifier, auth, chainId)
        }
    }

    /**
     * Create an eosjs compatible signature provider using this link.
     * @param availableKeys Keys the created provider will claim to be able to sign for.
     * @param chain Chain to use when configured with multiple chains.
     * @param transport (internal) Transport override for this call.
     * @note We don't know what keys are available so those have to be provided,
     *       to avoid this use [[LinkSession.makeSignatureProvider]] instead. Sessions can be created with [[Link.login]].
     */
    public makeSignatureProvider(
        availableKeys: string[],
        chain?: LinkChainType,
        transport?: LinkTransport
    ): any {
        return {
            getAvailableKeys: async () => availableKeys,
            sign: async (args) => {
                const t = transport || this.transport
                const c = chain ? this.getChain(chain) : this.chains[0]
                let request = SigningRequest.fromTransaction(
                    args.chainId,
                    args.serializedTransaction,
                    { abiProvider: c, zlib }
                )
                const callback = this.callbackService.create()
                request.setCallback(callback.url, true)
                request.setBroadcast(false)
                if (t.prepare) {
                    request = await t.prepare(request)
                }
                const { transaction, signatures } = await this.sendRequest(request, callback, c, t)
                const serializedTransaction = Serializer.encode({ object: transaction })
                return {
                    ...args,
                    serializedTransaction,
                    signatures,
                }
            },
        }
    }

    /** Makes sure session is in storage list of sessions and moves it to top (most recently used). */
    private async touchSession(
        identifier: NameType,
        auth: PermissionLevel,
        chainId: ChainId,
        remove = false
    ) {
        console.log("link.ts======================touchSession")
        const list = await this.listSessions(identifier)
        const existing = list.findIndex(
            (item) => item.auth.equals(auth) && item.chainId.equals(chainId)
        )
        console.log("existing = ", existing)
        if (existing >= 0) {
            list.splice(existing, 1)
        }
        console.log("remove = ", remove)
        if (remove === false) {
            list.unshift({ auth, chainId })
        }
        const key = this.sessionKey(identifier, 'list')
        console.log("key = ", key)
        const data = JSON.stringify(list)
        console.log("data = ", data)
        await this.storage!.write(key, data)
    }

    /**
     * Makes sure session is in storage list of sessions and moves it to top (most recently used).
     * @internal
     */
    async storeSession(session: LinkSession) {
        console.log("link.ts======================login")
        if (this.storage) {
            console.log("session.identifier = ", session.identifier)
            console.log("session.auth = ", session.auth)
            const auth = formatAuth(session.auth)
            console.log("session.chainId = ", session.chainId)
            const key = this.sessionKey(
                session.identifier,
                auth,
                String(session.chainId)
            )
            console.log("key = ", key)
            const data = JSON.stringify(session.serialize())
            console.log("data = ", data)
            await this.storage.write(key, data)
            await this.touchSession(session.identifier, session.auth, session.chainId)
        }
    }

    /** Session storage key for identifier and suffix. */
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
}

/**
 * Format a EOSIO permission level in the format `actor@permission` taking placeholders into consideration.
 * @internal
 */
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