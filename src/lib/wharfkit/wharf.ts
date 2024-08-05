/**
 * 
 * tudo: kurt
 * 
 * integrate currentAccount to Wharf Class?
 * 
 */
import SessionKit from "@wharfkit/session";
import { Session, type ChainIndices, type SessionKitArgs } from "@wharfkit/session";
import { Chains } from "@wharfkit/session";
import WebRenderer from "@wharfkit/web-renderer";
import type { WalletPlugin } from "@wharfkit/session";
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor";
import { AccountKit } from "@wharfkit/account";
import { ChainDefinition } from "@wharfkit/session";
import { ContractKit } from "@wharfkit/contract";
import { APIClient, Name } from '@wharfkit/antelope'
import { Contract } from "@wharfkit/contract";
import { derived, writable } from "svelte/store";
import type { Readable, Writable } from "svelte/store";
import type { TransactArgs, TransactOptions } from "@wharfkit/session";

const walletPlugins: WalletPlugin[] = [new WalletPluginAnchor()];

const seessionArgs: SessionKitArgs = {
    appName: "unicove1.1",
    chains: [Chains.Jungle4, Chains.WAXTestnet],
    ui: new WebRenderer(),
    walletPlugins: walletPlugins
}
export const sessionKit: SessionKit = new SessionKit(seessionArgs)

export class WharfService {
    public session: Session;
    public actor: Name
    public chain: ChainDefinition
    public chainId: string
    public client: APIClient
    public accountKit: AccountKit
    public contractKit: ContractKit
    private systemContract: Contract | undefined;
    private tokenContract: Contract | undefined;

    constructor(session: Session) {
        this.session = session;
        this.actor = session.actor
        this.chain = session.chain
        this.chainId = String(this.chain.id)
        this.client = new APIClient({ url: this.chain.url })
        this.accountKit = new AccountKit(this.chain, { client: this.client })
        this.contractKit = new ContractKit({ client: this.client })
    }

    public async getSystemContract(): Promise<Contract> {
        if (!this.systemContract) {
            this.systemContract = await this.contractKit.load(Name.from("eosio"))
        }
        return this.systemContract;
    }

    public async getTokenContract(): Promise<Contract> {
        if (!this.tokenContract) {
            this.tokenContract = await this.contractKit.load(Name.from("eosio.token"))
        }
        return this.tokenContract;
    }

    public async transact(args: TransactArgs, options?: TransactOptions) {
        return this.session.transact(args, options)
    }
}

const wharfProvde = writable<Session | undefined>(undefined)

export function updateSession(session: Session | undefined) {
    wharfProvde.set(session)
}

export const wharf: Readable<WharfService | undefined> = derived(wharfProvde, ($wharfProvder) => {
    if ($wharfProvder) {
        return new WharfService($wharfProvder)
    }
})


