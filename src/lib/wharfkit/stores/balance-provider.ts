//todo: kurt
/**
 * core token balance + balanceProviders(how to query?)
 * 
 * delegated tokens(delegations.ts)
 * 
 * resource staked tokens(REX System, resource.ts)
 * 
 */

import type { Readable, Writable } from "svelte/store";
import { derived } from "svelte/store";
import { get } from "svelte/store";
import { readable, writable } from "svelte/store";

import { Name } from "@wharfkit/antelope";
import { Asset } from "@wharfkit/antelope";
import { activeSession, currentAccount } from "../store";
import { wharf } from "../wharf";
import { WharfService } from "../wharf";
import { configs } from "./network-provider";

import { DelegatedBandwidth } from "$lib/app/abi-types";
import { REXState } from "@wharfkit/resources";
import type { Session } from "@wharfkit/session";

import { fetchLightApiBalances } from "./balance-utils";

export interface Balance {
    quantity: Asset
}

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

const balancesProvider: Writable<Balance[]> = writable([], (set) => {
    // Update on a set interval
    const interval = setInterval(() => {
        const session = get(activeSession)
        if (session) {
            getBalances(set, session)
        }
    }, 30000)

    // Subscribe to changes to the active session and update on change
    const unsubscribe = activeSession.subscribe((session) => {
        if (session) {
            getBalances(set, session)
        }
    })

    return () => {
        unsubscribe()
        clearInterval(interval)
    }
})


export const balances: Readable<Balance[]> = derived([balancesProvider, activeSession],
    ([$balancesProvider, $activeSession]) => {
        if ($activeSession) {
            return $balancesProvider;
        }
        return []
    })

async function getBalances(set: (v: any) => void, session: Session) {
    const chain = session.chain
    const features = configs.get(String(chain.id))!.features
    console.log("features= ", features)
    if (features.lightapi) {
        getLightApiBalances(set, String(session.chain.id), session.actor)
    } else if (features.bloks) {

    }
}

export const getLightApiBalances = async (set: (v: any) => void, chindId: string, actor: Name) => {
    console.log("getLightApiBalances....................")
    fetchLightApiBalances(chindId, actor).then((result) => {
        set(result)
    }).catch((error) => {
        set([])
    })
}


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
                set(result);
            }).catch((err) => {
                console.log("####error: ", err)
                console.warn("Error retrieving REXState", err);
                set(undefined);
            })
    })
}
