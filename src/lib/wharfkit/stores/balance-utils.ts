import type { Balance } from "./balance-provider"
import type { Token } from "./tokens"
import { Name, Asset } from "@wharfkit/antelope"


export async function fetchLightApiBalances(chaindId: string, account: Name): Promise<Balance[]> {
    const data = await fetchData(chaindId, account)
    //tudo: parse balances
    return []
}

async function fetchBloksBalances(chaindId: string, account: Name): Promise<Balance[]> {
    return []
}

async function fetchData(chaindId: string, account: Name) {
    //Example: https://eos.light-api.net/api/account/eos/teamgreymass
    const apiUrl = `https://balances.unicove.com/api/balances/${chaindId}/${account}`
    console.log("apiUrl = ", apiUrl)
    return await fetch(apiUrl)
        .then((result) => {
            console.log("#################result:", result)
            return result
        })
        .catch((error) => {
            console.warn('An error occured while fetching token balances:', { error })
            return []
        })
}