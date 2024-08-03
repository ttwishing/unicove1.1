import type { NameType, AssetType } from "@wharfkit/antelope";


export interface Transfer {
    from: NameType;
    to: NameType;
    quantity: AssetType;
    memo: string;
}


