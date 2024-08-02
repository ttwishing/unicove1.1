import type { Readable } from 'svelte/store'
import { derived } from 'svelte/store'
import { get } from 'svelte/store'
import { REXState, Resources } from '@wharfkit/resources'

import { ChainDefinition } from '@wharfkit/session'
import { currentAccount, activeSession } from '../store'
import { getClient } from '../wharf'

// The state of the REX system
export const stateREX: Readable<REXState | undefined> = derived(
    [currentAccount],
    ([$currentAccount], set) => {
        if ($currentAccount && $currentAccount.data.rex_info) {
            // check support rex
            if ($currentAccount.data.rex_info) {
                const chain = get(activeSession)!.chain
                getREXState(set, chain)
                const interval = setInterval(() =>
                    getREXState(set, chain), 30000)
                return () => {
                    clearInterval(interval)
                }
            }
        }
    }
)

export const getREXState = async (set: (v: any) => void, chain: ChainDefinition) =>
    getResourceClient(chain)
        .v1.rex.get_state()
        .then((result) => set(result))
        .catch((e) => {
            // TODO: We should probably have some sort of error catcher for stuff like this?
            console.error(e)
            // Set to undefined, which is the same as uninitialized
            set(undefined)
        })

const getResourceClient = (chain: ChainDefinition) => {
    const api = getClient(chain)
    const options: any = { api }
    // if (chain.resourceSampleAccount) {
    //     options.sampleAccount = chain.resourceSampleAccount
    // }
    return new Resources(options)
}