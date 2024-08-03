import type { NameType, AssetType } from "@wharfkit/antelope";


export interface REXDeposit {
    owner: NameType;
    amount: AssetType;
}

export interface REXBuy {
    from: NameType;
    amount: AssetType;
}

export interface REXWithdraw {
    owner: NameType;
    rex: AssetType;
}
