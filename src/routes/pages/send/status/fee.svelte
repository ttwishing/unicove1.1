<script lang="ts">
    import { Asset } from "@wharfkit/antelope";

    import { activeBlockchain } from "$lib/app/store";
    import Completed from "./template/completed.svelte";

    export let txFee: Asset | undefined = undefined;
    export let quantity: Asset | undefined = undefined;

    let total: Asset | undefined = undefined;

    $: {
        total =
            quantity &&
            txFee &&
            Asset.fromUnits(
                quantity.units.toNumber() + txFee.units.toNumber(),
                $activeBlockchain!.coreTokenSymbol,
            );
    }
</script>

<Completed header="Network Fee">
    <span>{txFee}</span>
</Completed>

<Completed header="Total">
    <span>{total}</span>
</Completed>

<style lang="scss">
    span {
        line-height: 32px;
        vertical-align: middle;
    }
</style>
