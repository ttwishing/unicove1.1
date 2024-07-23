import { ChainId } from "@wharfkit/signing-request"
import { Asset, Name } from '@wharfkit/antelope'
import { BalanceProviders } from "$lib/balance-providers/types"


export const appId = 'wallet-test.gm'

export enum ChainFeatures {
    /** eosio.namebid https://github.com/EOSIO/eosio.contracts/blob/master/contracts/eosio.system/src/name_bidding.cpp */
    BidName,
    /** eosio.buyram / eosio.buyrambytes https://github.com/EOSIO/eosio.contracts/blob/master/contracts/eosio.system/src/delegate_bandwidth.cpp#L43 */
    BuyRAM,
    /** FIO Bundled Transactions https://fio.wiki/knowledge-base/protocol/bundling-and-fees/ */
    FIOBundledFees,
    /** Fuel https://greymass.com/fuel */
    Fuel,
    /** eosio.powerup https://github.com/EOSIO/eosio.contracts/pull/397 */
    PowerUp,
    /** eosio.rentcpu / eosio.rentnet https://github.com/EOSIO/eosio.contracts/blob/master/contracts/eosio.system/src/powerup.cpp */
    REX,
    /** eosio.delegatebw https://github.com/EOSIO/eosio.contracts/blob/master/contracts/eosio.system/src/delegate_bandwidth.cpp#L372 */
    Staking,
    /** eosio.voteproducer https://github.com/EOSIO/eosio.contracts/blob/master/contracts/eosio.system/src/voting.cpp */
    VoteProducer,
    /** delphioracle https://github.com/eostitan/delphioracle */
    DelphiOracle,
}

export interface ChainConfig {
    /** Short identifier. */
    id: string
    /** Display name. */
    name: string
    /** Chain Features */
    chainFeatures: Set<ChainFeatures>
    /** Chain ID. */
    chainId: ChainId
    /** System Token Contract Name */
    coreTokenContract: Name
    /** System Token Symbol */
    coreTokenSymbol: Asset.Symbol
    /** System Token Transfer Action */
    coreTokenTransfer: Name
    /** Node URL to use. */
    nodeUrl: string
    /** True if network is a testnet. */
    testnet: boolean
    /** Account to use for resource sampling */
    resourceSampleAccount?: string
    /** The number of milliseconds to base sample prices on */
    resourceSampleMilliseconds?: number
    /** Bloks url  */
    bloksUrl: string
    /** Available Balance Providers */
    balanceProviders?: Set<BalanceProviders>
    /** Is Banxa available for this chain */
    banxaEnabled?: boolean
    /** Banxa coin_code */
    banxa_coin_code?: string
    /** Is REX available for this chain */
    rexEnabled?: boolean
}

/** Supported chains. */
export const chains: ChainConfig[] = [
    {
        id: 'eos',
        chainFeatures: new Set([
            ChainFeatures.BidName,
            ChainFeatures.BuyRAM,
            ChainFeatures.Fuel,
            ChainFeatures.PowerUp,
            ChainFeatures.REX,
            ChainFeatures.Staking,
            ChainFeatures.VoteProducer,
            ChainFeatures.DelphiOracle,
        ]),
        chainId: ChainId.from('aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'),
        coreTokenSymbol: Asset.Symbol.from('4,EOS'),
        coreTokenContract: Name.from('eosio.token'),
        coreTokenTransfer: Name.from('transfer'),
        resourceSampleAccount: 'greymassfuel',
        name: 'EOS',
        nodeUrl: 'https://eos.greymass.com',
        testnet: false,
        bloksUrl: 'https://bloks.io',
        balanceProviders: new Set([BalanceProviders.LightAPI]),
        banxaEnabled: true,
        rexEnabled: true,
    },
    {
        id: 'fio',
        chainFeatures: new Set([ChainFeatures.FIOBundledFees, ChainFeatures.VoteProducer]),
        chainId: ChainId.from('21dcae42c0182200e93f954a074011f9048a7624c6fe81d3c9541a614a88bd1c'),
        coreTokenSymbol: Asset.Symbol.from('9,FIO'),
        coreTokenContract: Name.from('fio.token'),
        coreTokenTransfer: Name.from('trnsfiopubky'),
        name: 'FIO',
        nodeUrl: 'https://fio.greymass.com',
        testnet: false,
        bloksUrl: 'https://fio.bloks.io',
        balanceProviders: new Set([BalanceProviders.Bloks]),
    },
    {
        id: 'fio-testnet',
        chainFeatures: new Set([ChainFeatures.FIOBundledFees, ChainFeatures.VoteProducer]),
        chainId: ChainId.from('b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e'),
        coreTokenSymbol: Asset.Symbol.from('9,FIO'),
        coreTokenContract: Name.from('fio.token'),
        coreTokenTransfer: Name.from('trnsfiopubky'),
        name: 'FIO (Testnet)',
        nodeUrl: 'https://fiotestnet.greymass.com',
        testnet: true,
        bloksUrl: 'https://fio-test.bloks.io',
    },
    {
        id: 'jungle3',
        chainFeatures: new Set([
            ChainFeatures.BidName,
            ChainFeatures.BuyRAM,
            ChainFeatures.Fuel,
            ChainFeatures.PowerUp,
            ChainFeatures.REX,
            ChainFeatures.Staking,
            ChainFeatures.VoteProducer,
        ]),
        chainId: ChainId.from('2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840'),
        coreTokenSymbol: Asset.Symbol.from('4,EOS'),
        coreTokenContract: Name.from('eosio.token'),
        coreTokenTransfer: Name.from('transfer'),
        name: 'Jungle 3 (Testnet)',
        nodeUrl: 'https://jungle3.greymass.com',
        testnet: true,
        bloksUrl: 'https://jungle3.bloks.io',
        balanceProviders: new Set([BalanceProviders.Bloks]),
    },
    {
        id: 'jungle4',
        chainFeatures: new Set([
            ChainFeatures.BidName,
            ChainFeatures.BuyRAM,
            ChainFeatures.Fuel,
            ChainFeatures.PowerUp,
            ChainFeatures.REX,
            ChainFeatures.Staking,
            ChainFeatures.VoteProducer,
        ]),
        chainId: ChainId.from('73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d'),
        coreTokenSymbol: Asset.Symbol.from('4,EOS'),
        coreTokenContract: Name.from('eosio.token'),
        coreTokenTransfer: Name.from('transfer'),
        resourceSampleAccount: 'greymassfuel',
        name: 'Jungle 4 (Testnet)',
        nodeUrl: 'https://jungle4.greymass.com',
        testnet: true,
        bloksUrl: 'https://eosauthority.com/?network=jungle',
        rexEnabled: true,
    },
    {
        id: 'proton',
        chainFeatures: new Set([
            ChainFeatures.BuyRAM,
            ChainFeatures.Staking,
            ChainFeatures.VoteProducer,
        ]),
        chainId: ChainId.from('384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0'),
        coreTokenSymbol: Asset.Symbol.from('4,XPR'),
        coreTokenContract: Name.from('eosio.token'),
        coreTokenTransfer: Name.from('transfer'),
        name: 'Proton',
        nodeUrl: 'https://proton.greymass.com',
        testnet: false,
        bloksUrl: 'https://proton.bloks.io',
        balanceProviders: new Set([BalanceProviders.LightAPI]),
    },
    {
        id: 'telos',
        chainFeatures: new Set([
            ChainFeatures.BidName,
            ChainFeatures.BuyRAM,
            ChainFeatures.Fuel,
            ChainFeatures.REX,
            ChainFeatures.Staking,
            ChainFeatures.VoteProducer,
        ]),
        chainId: ChainId.from('4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11'),
        coreTokenSymbol: Asset.Symbol.from('4,TLOS'),
        coreTokenContract: Name.from('eosio.token'),
        coreTokenTransfer: Name.from('transfer'),
        name: 'Telos',
        nodeUrl: 'https://telos.greymass.com',
        resourceSampleAccount: 'greymassfuel',
        resourceSampleMilliseconds: 1000,
        testnet: false,
        bloksUrl: 'https://explorer.telos.net',
        balanceProviders: new Set([BalanceProviders.LightAPI]),
    },
    {
        id: 'telos-testnet',
        chainFeatures: new Set([
            ChainFeatures.BidName,
            ChainFeatures.BuyRAM,
            ChainFeatures.Fuel,
            ChainFeatures.REX,
            ChainFeatures.Staking,
            ChainFeatures.VoteProducer,
        ]),
        chainId: ChainId.from('1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f'),
        coreTokenSymbol: Asset.Symbol.from('4,TLOS'),
        coreTokenContract: Name.from('eosio.token'),
        coreTokenTransfer: Name.from('transfer'),
        name: 'Telos (Testnet)',
        nodeUrl: 'https://testnet.telos.net',
        resourceSampleAccount: 'greymassfuel',
        resourceSampleMilliseconds: 1000,
        testnet: true,
        bloksUrl: 'https://telos-test.bloks.io',
        balanceProviders: new Set([BalanceProviders.Bloks]),
    },
    {
        id: 'wax',
        chainFeatures: new Set([
            ChainFeatures.BidName,
            ChainFeatures.BuyRAM,
            ChainFeatures.Fuel,
            ChainFeatures.PowerUp,
            ChainFeatures.Staking,
            ChainFeatures.VoteProducer,
            ChainFeatures.DelphiOracle,
        ]),
        chainId: ChainId.from('1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4'),
        coreTokenSymbol: Asset.Symbol.from('8,WAX'),
        coreTokenContract: Name.from('eosio.token'),
        coreTokenTransfer: Name.from('transfer'),
        name: 'WAX',
        banxa_coin_code: 'WAXP',
        nodeUrl: 'https://wax.greymass.com',
        resourceSampleAccount: 'boost.wax',
        testnet: false,
        bloksUrl: 'https://wax.bloks.io',
        balanceProviders: new Set([BalanceProviders.LightAPI]),
        banxaEnabled: true,
    },
]

export function chainConfig(chainId: ChainId): ChainConfig {
    return chains.find((c) => c.chainId.equals(chainId))!
}