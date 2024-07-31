import SessionKit from "@wharfkit/session";
import type { SessionKitArgs } from "@wharfkit/session";
import { Chains } from "@wharfkit/session";
import WebRenderer from "@wharfkit/web-renderer";
import type { WalletPlugin } from "@wharfkit/session";
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor";
import { AccountKit } from "@wharfkit/account";


const walletPlugins: WalletPlugin[] = [new WalletPluginAnchor()];

const seessionArgs: SessionKitArgs = {
    appName: "unicove1.1",
    chains: [Chains.Jungle4],
    ui: new WebRenderer(),
    walletPlugins: walletPlugins
}
export const sessionKit: SessionKit = new SessionKit(seessionArgs)


const accountKitOptions = {
}
export const accountKit: AccountKit = new AccountKit(Chains.Jungle4, accountKitOptions)