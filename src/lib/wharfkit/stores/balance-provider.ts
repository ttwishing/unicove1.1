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
import { currentAccount } from "../store";
import { wharf } from "../wharf";
import { WharfService } from "../wharf";
import { configs } from "./network-provider";

import { DelegatedBandwidth, DelphiOraclePair, DelphiOracleDatapoint } from "$lib/app/abi-types";
import { REXState } from "@wharfkit/resources";
import type { Session } from "@wharfkit/session";
import { Contract } from "@wharfkit/contract";

import { fetchLightApiBalances } from "./balance-utils";

export interface Balance {
    quantity: Asset
}

export const systemTokenBalance: Readable<Balance | undefined> = derived(
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
        const wf = get(wharf)
        if (wf) {
            getBalances(set, wf)
        } else {
            set([])
        }
    }, 30000)

    // Subscribe to changes to the active session and update on change
    const unsubscribe = wharf.subscribe((wharf) => {
        if (wharf) {
            getBalances(set, wharf)
        } else {
            set([])
        }
    })

    return () => {
        unsubscribe()
        clearInterval(interval)
    }
})


export const balances: Readable<Balance[]> = derived([balancesProvider],
    ([$balancesProvider]) => $balancesProvider
)

async function getBalances(set: (v: any) => void, wharf: WharfService) {
    const features = configs.get(wharf.chainId)!.features
    if (features.lightapi) {
        getLightApiBalances(set, wharf.chainId, wharf.actor)
    } else if (features.bloks) {

    }
}

export const getLightApiBalances = async (set: (v: any) => void, chindId: string, actor: Name) => {
    fetchLightApiBalances(chindId, actor).then((result) => {
        set(result)
    }).catch((error) => {
        set([])
    })
}


export const delegations: Readable<DelegatedBandwidth[]> = derived(
    [wharf],
    ([$wharf], set) => {
        if ($wharf) {
            getDeleted(set, $wharf, $wharf.actor)
        } else {
            set([])
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
    [wharf],
    ([$wharf], set) => {
        if ($wharf && configs.get($wharf.chainId)!.features.rex) {
            getREXState(set, $wharf, $wharf.actor)
            const interval = setInterval(() =>
                getREXState(set, $wharf, $wharf.actor), 30000)
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


export const priceTicker: Readable<number> = derived(
    [wharf],
    ([$wharf], set) => {
        if ($wharf && configs.get($wharf.chainId)?.features.delphioracle) {
            getPriceTicker(set, $wharf)
        } else {
            set(0)
        }
    },
);

const getPriceTicker = async (set: (v: any) => void, wharf: WharfService, pairName?: string) => {
    let start = Date.now()
    wharf.getDelphiOracleContract().then(result => {
        // console.log("contract_cost = ", (Date.now() - start))
        start = Date.now()
        getDataPoint(result, wharf, pairName).then(reuslt => {
            // console.log("api_cost = ", (Date.now() - start))
            set(result)
        }).catch(error => {
            // console.log("api_error = ", error)
            set(0)
        })
    }).catch(error => {
        // console.log("contract_error = ", error)
        set(0);
    })
    // console.log("cost = ", (Date.now() - start))
}

async function getDataPoint(contract: Contract, wharf: WharfService, pairName?: string) {
    //getOraclePairs
    const pairs: DelphiOraclePair[] = await contract.table("pairs", "delphioracle", DelphiOraclePair).all()
    let pairLatest = pairs[0]
    if (!pairLatest) {
        throw new Error(`No pair for ${pairName} on ${wharf.chainId}`)
    }
    let pair: DelphiOraclePair | undefined
    if (!pairName) {
        pair = pairs.find(
            (p) => p.base_symbol.equals(wharf.coreTokenSymbol) && p.quote_symbol.name === 'USD'
        )
    } else {
        pair = pairs.find((p) => p.name.equals(pairName))
    }

    if (!pair)
        throw new Error(`No pair for ${pairName} on ${wharf.chainId}`)

    const resPairName = pair.name;
    console.log("resPairName = ", resPairName)
    const datapoint: DelphiOracleDatapoint = await contract.table("datapoints", resPairName, DelphiOracleDatapoint).get();
    if (!datapoint) {
        throw new Error(`No datapoint for ${pairName} on ${wharf.chainId}`)
    }
    console.log("median = ", datapoint.median.toNumber())
    console.log("quoted_precision = ", pair.quoted_precision.toNumber())
    const result = datapoint.median.toNumber() / Math.pow(10, pair.quoted_precision.toNumber())
    console.log("result = ", result)
    return result;
}

