import type { ChainConfig } from '$lib/app/config'
import { Asset, Int64, Int128 } from '@wharfkit/antelope';
import type { Readable } from 'svelte/motion';
import { REXState } from '@wharfkit/resources';
import type { Token } from '$lib/wharfkit/tokens';
import { currentAccount } from '$lib/wharfkit/auth';
import { get } from 'svelte/store';

export const rexIsAvailable = (chainData: ChainConfig | undefined): boolean => {
    return !!chainData?.rexEnabled
}


export const convertRexToEos = (rex: number, stateREX?: REXState, token?: Token) => {
    const pool = stateREX;
    if (!token || !pool) {
        return Asset.from(0, token!.symbol);
    }

    const { total_lendable, total_rex } = pool;
    const asset = Asset.from(rex, "4,REX");
    const R1: Int64 = total_rex.units.adding(asset.units);
    const S1: Int128 = Int128.from(R1);
    const S2: Int128 = S1.multiplying(total_lendable.units);
    const S3 = S2.dividing(total_rex.units);
    const result = S3.subtracting(total_lendable.units);
    // Debugging using floats
    // const oS0 = parseFloat(String(pool.total_lendable).split(' ')[0])
    // const oR0 = parseFloat(String(pool.total_rex).split(' ')[0])
    // const oR1 = oR0 + rex
    // const oS1 = (oS0 * oR1) / oR0
    // console.table({
    //     S0: [String(S0), String(oS0)],
    //     R0: [String(R0), String(oR0)],
    //     R1: [String(R1), String(oR1)],
    //     S1: [String(S1), String((oS0 * oR1) / oR0)],
    //     result: [String(result), String(oS1 - oS0)],
    // })

    return Asset.fromUnits(result, token!.symbol);
};


export const convertEosToRex = (eos: number, stateREX?: REXState, token?: Token) => {
    const pool = stateREX
    if (!token || !pool) {
        return Asset.from(0, token!.symbol)
    }

    const { total_lendable, total_rex } = pool
    const asset = Asset.from(eos, token!.symbol)
    const S1 = total_lendable.units.adding(asset.units)
    const R1 = Int128.from(S1).multiplying(total_rex.units).dividing(total_lendable.units)
    const result = R1.subtracting(total_rex.units)

    // Debugging using floats
    // const oS0 = parseFloat(String(pool.total_lendable).split(' ')[0])
    // const oS1 = oS0 + eos
    // const oR0 = parseFloat(String(pool.total_rex).split(' ')[0])
    // const oR1 = (oS1 * oR0) / oS0

    // console.table({
    //     S0: [String(S0), String(oS0)],
    //     R0: [String(R0), String(oR0)],
    //     R1: [String(R1), String(oR1)],
    //     S1: [String(S1), String((oS0 * oR1) / oR0)],
    //     result: [String(result), String(oR1 - oR0)],
    // })

    return Asset.fromUnits(result, get(currentAccount)!.data.rex_info!.rex_balance.symbol)
}