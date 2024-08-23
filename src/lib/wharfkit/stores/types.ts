import { Asset, Struct, UInt64, UInt8 } from '@wharfkit/antelope'
import { Int } from '@wharfkit/antelope'

@Struct.type('rexstate')
export class REXState extends Struct {
    @Struct.field('uint8') version!: UInt8
    @Struct.field('asset') total_lent!: Asset
    @Struct.field('asset') total_unlent!: Asset
    @Struct.field('asset') total_rent!: Asset
    @Struct.field('asset') total_lendable!: Asset
    @Struct.field('asset') total_rex!: Asset
    @Struct.field('asset') namebid_proceeds!: Asset
    @Struct.field('uint64') loan_num!: UInt64

    // public get reserved() {
    //     return Number(this.total_lent.units) / Number(this.total_lendable.units)
    // }

    // public get symbol() {
    //     return this.total_lent.symbol
    // }

    // public get precision() {
    //     return this.total_lent.symbol.precision
    // }

    public get value() {
        // wharfkit/resourses
        // return (
        //     (Number(this.total_lent.units) + Number(this.total_unlent.units)) /
        //     Number(this.total_rex.units)
        // )


        // greymass/eosio-resources
        const factor = 10 ** this.total_unlent.symbol.precision
        return (
            Number(
                this.total_lent.units
                    .adding(this.total_unlent.units)
                    .dividing(this.total_rex.units.dividing(factor))
            ) / factor
        )
    }

    // exchange(amount: Asset): Asset {
    //     return Asset.from(
    //         (amount.value * this.total_lendable.value) / this.total_rex.value,
    //         this.symbol
    //     )
    // }


}
