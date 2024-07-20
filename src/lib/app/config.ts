import { ChainId } from "@wharfkit/signing-request"
import { Asset, Name } from '@wharfkit/antelope'


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

export const chains: ChainConfig[] = [
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
    }
]

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
    // balanceProviders?: Set<BalanceProviders>
    /** Is Banxa available for this chain */
    banxaEnabled?: boolean
    /** Banxa coin_code */
    banxa_coin_code?: string
    /** Is REX available for this chain */
    rexEnabled?: boolean
}