import { Chains } from "@wharfkit/session";
import { Asset } from "@wharfkit/session";
export type FeatureType = 'rex' | 'lightapi' | 'bloks' | 'fuel' | 'powerup' | 'staking' | 'buyram' | 'delphioracle';


export interface ChainConfig {
    features: Record<FeatureType, boolean>;
    symbol: Asset.SymbolType; //todo: kurt  read from acount or buildIn
    testnet: boolean;
    name: string;
}

export enum BalanceType {
    Bloks,
    LightAPI,
}

export const configs: Map<string, ChainConfig> = new Map();

configs.set(String(Chains.EOS.id), {
    features: {
        rex: true,
        lightapi: true,
        bloks: false,
        fuel: true,
        powerup: true,
        staking: true,
        buyram: true,
        delphioracle: true,
    },
    symbol: '4,EOS',
    testnet: false,
    name: "eos",
})

configs.set(String(Chains.Jungle4.id), {
    features: {
        rex: true,
        lightapi: false,
        bloks: false,
        fuel: true,
        powerup: true,
        staking: true,
        buyram: true,
        delphioracle: false,
    },
    symbol: '4,EOS',
    testnet: true,
    name: 'jungle4',
})
configs.set(String(Chains.WAXTestnet.id), {
    features: {
        rex: false,
        lightapi: true,
        bloks: false,
        fuel: true,
        powerup: true,
        staking: true,
        buyram: true,
        delphioracle: false,
    },
    symbol: '8,WAX',
    testnet: true,
    name: "wax",
})

