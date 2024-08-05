<script lang="ts">
    import type { Readable } from "svelte/store";
    import { derived } from "svelte/store";

    import { activeBlockchain, activeSession } from "$lib/app/store";
    import { activeChainFeatures } from "$lib/wharfkit/store";

    import Page from "../../layout/page.svelte";
    import Button from "$lib/components/elements/button.svelte";

    import ResourcesOverview from "./pages/index.svelte";
    // import ResourcesOverviewNet from "~/pages/resources/pages/net.svelte";
    // import ResourcesRAMBuy from "~/pages/resources/pages/ram/buy.svelte";
    // import ResourcesRAMSell from "~/pages/resources/pages/ram/sell.svelte";
    // import ResourcesCPUFuel from "~/pages/resources/pages/cpu/fuel.svelte";
    // import ResourcesCPUPowerUp from "~/pages/resources/pages/cpu/powerup.svelte";
    // import ResourcesCPUREX from "~/pages/resources/pages/cpu/rex.svelte";
    // import ResourcesNETFuel from "~/pages/resources/pages/net/fuel.svelte";
    // import ResourcesNETPowerUp from "~/pages/resources/pages/net/powerup.svelte";
    // import ResourcesNETREX from "~/pages/resources/pages/net/rex.svelte";
    // import ResourcesCPUStaking from "~/pages/resources/pages/cpu/staking.svelte";
    // import ResourcesNETStaking from "~/pages/resources/pages/net/staking.svelte";

    const enabled: Readable<boolean> = derived(
        [activeChainFeatures],
        ([$activeChainFeatures]) => {
            if ($activeChainFeatures) {
                if (
                    $activeChainFeatures.features.rex ||
                    $activeChainFeatures.features.fuel ||
                    $activeChainFeatures.features.powerup ||
                    $activeChainFeatures.features.staking
                ) {
                    return true;
                }
            }
            return false;
        },
    );
</script>

{#if $activeBlockchain}
    <Page
        title="Network Resources"
        subtitle={String($activeSession?.auth.actor)}
    >
        {#if $enabled}
            <ResourcesOverview />
        {:else}
            <p>
                Resource management not available on the {$activeBlockchain.name}
                blockchain.
            </p>
            <Button href="/">Back to Dashboard</Button>
        {/if}
    </Page>
{/if}
