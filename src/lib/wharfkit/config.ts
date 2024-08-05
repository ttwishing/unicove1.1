import { Chains } from "@wharfkit/session";
export type FeatureType = 'rex';


export interface ChainConfig {
    features: Record<FeatureType, boolean>;
}

export const configs: Map<string, ChainConfig> = new Map();
configs.set(String(Chains.Jungle4.id), {
    features: {
        rex: true
    }
})
configs.set(String(Chains.WAXTestnet.id), {
    features: {
        rex: false
    }
})