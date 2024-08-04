/**
 * 
 * tudo: kurt
 * 
 * integrate activeSession, currentAccount to Wharf Class?
 * 
 */

import SessionKit from "@wharfkit/session";
import type { ChainIndices, SessionKitArgs } from "@wharfkit/session";
import { Chains } from "@wharfkit/session";
import WebRenderer from "@wharfkit/web-renderer";
import type { WalletPlugin } from "@wharfkit/session";
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor";
import { AccountKit } from "@wharfkit/account";
import { chainIdsToIndices } from "@wharfkit/session";
import { ChainDefinition } from "@wharfkit/session";
import { ContractKit } from "@wharfkit/contract";
import { APIClient, Name } from '@wharfkit/antelope'
import { Contract } from "@wharfkit/contract";
import { derived } from "svelte/store";
import type { Readable } from "svelte/store";
import { activeSession } from "./store";

const walletPlugins: WalletPlugin[] = [new WalletPluginAnchor()];

const seessionArgs: SessionKitArgs = {
    appName: "unicove1.1",
    chains: [Chains.Jungle4, Chains.WAXTestnet],
    ui: new WebRenderer(),
    walletPlugins: walletPlugins
}
export const sessionKit: SessionKit = new SessionKit(seessionArgs)

class WharfService {
    public chain: ChainDefinition
    public client: APIClient
    public accountKit: AccountKit
    public contractKit: ContractKit
    private systemContract: Contract | undefined;
    private tokenContract: Contract | undefined;

    constructor(chain: ChainDefinition) {
        this.chain = chain
        this.client = new APIClient({ url: chain.url })
        this.accountKit = new AccountKit(chain, { client: this.client })
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

}

export const wharf: Readable<WharfService | undefined> = derived(activeSession, ($activeSession) => {
    if ($activeSession) {
        return new WharfService($activeSession!.chain)
    }
})


