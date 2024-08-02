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
import { APIClient } from '@wharfkit/antelope'

const walletPlugins: WalletPlugin[] = [new WalletPluginAnchor()];

const seessionArgs: SessionKitArgs = {
    appName: "unicove1.1",
    chains: [Chains.Jungle4, Chains.WAXTestnet],
    ui: new WebRenderer(),
    walletPlugins: walletPlugins
}
export const sessionKit: SessionKit = new SessionKit(seessionArgs)


const accountKits = new Map<string, AccountKit>()

export function getAccountKit(chain: ChainDefinition): AccountKit {
    const chainId = String(chain.id)
    let accountKit = accountKits.get(chainId)
    if (!accountKit) {
        accountKit = new AccountKit(chain, { client: getClient(chain) })
        accountKits.set(chainId, accountKit)
    }
    return accountKit
}

const contractKits = new Map<string, ContractKit>()

export function getContractKit(chain: ChainDefinition): ContractKit {
    const chainId = String(chain.id)
    let contractKit = contractKits.get(chainId)
    if (!contractKit) {
        contractKit = new ContractKit({
            client: getClient(chain)
        })
        contractKits.set(chainId, contractKit)
    }
    return contractKit
}


const clients = new Map<string, APIClient>()

/**
 * Get a APIClient instance for given chain config or chain id.
 */
export function getClient(chain: ChainDefinition): APIClient {
    const chainId = String(chain.id)
    let client = clients.get(chainId)
    if (!client) {
        client = new APIClient({ url: chain.url })
        clients.set(chainId, client)
    }
    return client
}
