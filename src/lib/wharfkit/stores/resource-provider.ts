import type { Readable } from "svelte/store"
import { derived } from "svelte/store"
import { get } from "svelte/store"
import { RAMState } from "@wharfkit/resources"
import { activeChainFeatures } from "../store"
import type { ChainDefinition } from "@wharfkit/session"
import { configs } from "./network-provider"
import { wharf } from "../wharf"

// The state of the REX system
export const stateRAM: Readable<RAMState | undefined> = derived(
    [wharf],
    ([$wharf], set) => {
        if ($wharf) {
            const chianConfig = configs.get($wharf.chainId)
            if (chianConfig!.features.buyram) {
                const unsubscribe = activeChainFeatures.subscribe((value) => {
                    if (value) {
                        getRAMState(set)
                    }
                })
                const interval = setInterval(() => getRAMState(set), 30000)
                return () => {
                    unsubscribe()
                    clearInterval(interval)
                }
            }
        }
    }
)


export const getRAMState = async (set: (v: any) => void) => {
    set([])
}
// wharf.getSystemContract().then((contract) => {
//     contract.table("delband", actor, DelegatedBandwidth).all()
//         .then((result) => {
//             set(result);
//         }).catch((err) => {
//             console.warn("Error retrieving delegations", err);
//             set([]);
//         })
// })

