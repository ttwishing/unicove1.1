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

export interface Balance {
    quantity: Asset,
    contract: Name,
}

export interface BalancePrice {
    contract: Name,
    price: number,
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
            set({ quantity: coreBalance, contract: $currentAccount.token.contract.account })
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

export const balancePrices: Readable<BalancePrice[]> = derived([balances], ([$balances]) => {
    return []
})


export const getLightApiBalances = async (set: (v: any) => void, chindName: string, actor: Name) => {
    fetchLightApiBalances(chindName, actor).then((result) => {
        set(result)
    }).catch((error) => {
        set([])
    })
}

async function getBalances(set: (v: any) => void, wharf: WharfService) {
    const features = configs.get(wharf.chainId)!.features
    if (features.lightapi) {
        getLightApiBalances(set, wharf.chainName, wharf.actor)
    } else if (features.bloks) {

    }
}

export const delegations: Readable<DelegatedBandwidth[]> = derived(
    [wharf],
    ([$wharf], set) => {
        set([])
        if ($wharf) {
            getDeleted(set, $wharf, $wharf.actor)
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
        set(undefined)
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
                console.warn("Error retrieving REXState", err);
                set(undefined);
            })
    })
}


export const priceTicker: Readable<number> = derived(
    [wharf],
    ([$wharf], set) => {
        if ($wharf && configs.get($wharf.chainId)?.features.delphioracle) {
            loadPriceTicker("priceTicker", set, $wharf)
        } else {
            set(0)
        }
    },
);

export const loadPriceTicker = async (portal: string, set: (v: any) => void, wharf: WharfService, pairName?: string) => {
    if (!configs.get(wharf.chainId)?.features.delphioracle) {
        set(0);
        return;
    }
    let start = Date.now()
    wharf.getDelphiOracleContract().then(result => {
        // console.log("contract_cost = ", (Date.now() - start))
        start = Date.now()
        getDataPoint(portal, result, wharf, pairName).then(price => {
            // console.log("api_cost = ", (Date.now() - start))
            set(price)
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

async function getDataPoint(portal: string, contract: Contract, wharf: WharfService, pairName?: string): Promise<number> {
    // console.log("getDataPoint========================", portal, pairName)
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

    const resPairName = pair.name;  //eosusd
    // console.log("resPairName = ", String(resPairName))
    const datapoint: DelphiOracleDatapoint = await contract.table("datapoints", resPairName, DelphiOracleDatapoint).get();
    if (!datapoint) {
        throw new Error(`No datapoint for ${pairName} on ${wharf.chainId}`)
    }

    const result = datapoint.median.toNumber() / Math.pow(10, pair.quoted_precision.toNumber())
    // console.log("result = ", result)
    return result;
}


async function fetchLightApiBalances(chainName: string, account: Name): Promise<Balance[]> {
    const apiUrl = `https://balances.unicove.com/api/balances/${chainName}/${account}`
    let response: Response | undefined = undefined
    try {
        response = await fetch(apiUrl);
    } catch (error) {
    }
    if (!response)
        return []

    let jsonBody = undefined
    try {
        jsonBody = await response.json()
    } catch (error) {
    }

    if (!jsonBody) {
        return []
    }
    const balances: RawTokenBalance[] = jsonBody.balances
    balances.forEach((value, index) => {
        console.log(`${index} = `, value)
    })
    return balances
        .filter((balance) => {
            //return balance.amount && Number(balance.amount) !== 0
            return true;
        })
        .map((balance) => {
            const symbol: Asset.Symbol = Asset.Symbol.from(
                `${balance.decimals},${balance.currency}`
            )
            const amount = balance.amount ? Number(balance.amount) : 0
            const asset = Asset.from(amount, symbol)
            const record: Balance = {
                contract: Name.from(balance.contract),
                quantity: asset,
            }
            return record
        })
        .filter((balance) => !!balance)
}

async function fetchBloksBalances(chaindId: string, account: Name): Promise<Balance[]> {
    return []
}



interface RawTokenBalance {
    currency: string
    amount: string
    decimals: number
    contract: string
}
