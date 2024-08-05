import type { Readable } from "svelte/store"
import { derived } from "svelte/store"
import { get } from "svelte/store"
import { RAMState } from "@wharfkit/resources"
import { activeChainFeatures, activeSession } from "../store"
import type { ChainDefinition } from "@wharfkit/session"
import { configs } from "./network-provider"
import { wharf } from "../wharf"

// The state of the REX system
export const stateRAM: Readable<RAMState | undefined> = derived(
    [activeSession],
    ([$activeSession], set) => {
        if ($activeSession) {
            const chianConfig = configs.get(String($activeSession.chain.id))
            if (chianConfig!.features.buyram) {
                const unsubscribe = activeChainFeatures.subscribe((value) => {
                    if (value) {
                        getRAMState(set, $activeSession.chain)
                    }
                })
                const interval = setInterval(() => getRAMState(set, $activeSession.chain), 30000)
                return () => {
                    unsubscribe()
                    clearInterval(interval)
                }
            }
        }
    }
)


export const getRAMState = async (set: (v: any) => void, chain: ChainDefinition) => {
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

