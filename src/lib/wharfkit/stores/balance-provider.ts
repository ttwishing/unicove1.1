//todo: kurt
/**
 * core token balance + balanceProviders(how to query?)
 * 
 * delegated tokens(delegations.ts)
 * 
 * resource staked tokens(REX System, resource.ts)
 * 
 */

import type { Readable } from "svelte/store";
import { derived } from "svelte/store";
import { get } from "svelte/store";
import { readable } from "svelte/store";

import { Name } from "@wharfkit/antelope";
import { Asset } from "@wharfkit/antelope";
import { activeSession, currentAccount } from "../store";
import { wharf } from "../wharf";
import { WharfService } from "../wharf";
import { configs } from "../config";

import { DelegatedBandwidth } from "$lib/app/abi-types";
import { REXState } from "@wharfkit/resources";


export interface Balance {
    quantity: Asset
}

export const balances: Readable<Balance[]> = readable([])

export const coreTokenBalance: Readable<Balance | undefined> = derived(
    [currentAccount],
    ([$currentAccount], set) => {
        let coreBalance: Asset | undefined = undefined
        if ($currentAccount) {
            coreBalance = $currentAccount.data.core_liquid_balance
            if (!coreBalance) {
                coreBalance = Asset.from(0, $currentAccount.systemToken)
            }
            set({ quantity: coreBalance })
        }
    }
)

export const delegations: Readable<DelegatedBandwidth[]> = derived(
    [activeSession, wharf],
    ([$activeSession, $wharf], set) => {
        if ($activeSession && $wharf) {
            getDeleted(set, $wharf, $activeSession.actor)
        }
    },
);


export const getDeleted = async (set: (v: any) => void, wharf: WharfService, actor: Name) => {
    wharf.getSystemContract().then((contract) => {
        contract.table("delband", actor, DelegatedBandwidth).all()
            .then((result) => {
                set(result);
            }).catch((err) => {
                console.warn("Error retrieving delegations", err);
                set([]);
            })
    })
}


export const stateREX: Readable<REXState | undefined> = derived(
    [activeSession, wharf],
    ([$activeSession, $wharf], set) => {
        if ($activeSession && $wharf && configs.get(String($activeSession.chain.id))!.features.rex) {
            const chain = get(activeSession)!.chain
            getREXState(set, $wharf, $activeSession.actor)
            const interval = setInterval(() =>
                getREXState(set, $wharf, $activeSession.actor), 30000)
            return () => {
                clearInterval(interval)
            }
        }
    }
)


export const getREXState = async (set: (v: any) => void, wharf: WharfService, actor: Name) => {
    wharf.getSystemContract().then((contract) => {
        contract.table("rexpool", "eosio", REXState).get()
            .then((result) => {
                console.log("####Result: ", result)
                set(result);
            }).catch((err) => {
                console.log("####error: ", err)
                console.warn("Error retrieving REXState", err);
                set(undefined);
            })
    })
}
