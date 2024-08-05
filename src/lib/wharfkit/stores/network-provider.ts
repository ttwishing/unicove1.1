import { Chains } from "@wharfkit/session";
export type FeatureType = 'rex' | 'lightapi' | 'bloks' | 'fuel' | 'powerup' | 'staking' | 'buyram';


export interface ChainConfig {
    features: Record<FeatureType, boolean>;
}

export enum BalanceType {
    Bloks,
    LightAPI,
}

export const configs: Map<string, ChainConfig> = new Map();

configs.set(String(Chains.Jungle4.id), {
    features: {
        rex: true,
        lightapi: false,
        bloks: false,
        fuel: true,
        powerup: true,
        staking: true,
        buyram: true,
    }
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
    }
})