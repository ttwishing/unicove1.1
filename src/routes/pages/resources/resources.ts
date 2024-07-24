import type { Readable } from 'svelte/store'
import { derived } from 'svelte/store'
import { REXState, Resources } from '@wharfkit/resources'
import { activeBlockchain } from '$lib/app/store'
import { ChainFeatures } from '$lib/app/config'
import type { ChainConfig } from '$lib/app/config'
import { getClient } from '$lib/app/api-client'

// The state of the REX system
export const stateREX: Readable<REXState | undefined> = derived(
    [activeBlockchain],
    ([$activeBlockchain], set) => {
        if ($activeBlockchain && $activeBlockchain.chainFeatures.has(ChainFeatures.REX)) {
            getREXState(set, $activeBlockchain)
            const interval = setInterval(() => getREXState(set, $activeBlockchain), 30000)
            return () => {
                clearInterval(interval)
            }
        }
    }
)

export const getREXState = async (set: (v: any) => void, chain: ChainConfig) =>
    getResourceClient(chain)
        .v1.rex.get_state()
        .then((result) => set(result))
        .catch((e) => {
            // TODO: We should probably have some sort of error catcher for stuff like this?
            console.error(e)
            // Set to undefined, which is the same as uninitialized
            set(undefined)
        })

const getResourceClient = (chain: ChainConfig) => {
    const api = getClient(chain)
    const options: any = { api }
    if (chain.resourceSampleAccount) {
        options.sampleAccount = chain.resourceSampleAccount
    }
    return new Resources(options)
}