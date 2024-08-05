<script lang="ts">
    import type { Readable } from "svelte/store";
    import { derived } from "svelte/store";

    import { resourceFeatures } from "$lib/app/config";
    import { activeBlockchain } from "$lib/app/store";
    import { rexIsAvailable, isRexAvailable } from "$lib/utils/rex";

    import MediaQuery from "$lib/components/utils/media-query.svelte";
    import NavigationContent from "./content.svelte";
    import type { NavigationItem } from "$lib/app/ui-types";

    import { activeChainFeatures, activeSession } from "$lib/wharfkit/store";

    export let open = false;
    export const handleNaviClick = null;

    $: primaryNavigation = [
        {
            exactPath: true,
            icon: "layout",
            name: "Dashboard",
            path: "/",
        },
        {
            icon: "arrow-right",
            name: "Send",
            path: "/send",
        },
        {
            icon: "arrow-right",
            name: "Receive",
            path: "/receive",
        },
        ...(isRexAvailable($activeChainFeatures)
            ? [
                  {
                      icon: "dollar-sign",
                      name: "Earn",
                      path: "/earn",
                  },
              ]
            : []),
    ];

    const advancedNavigation: Readable<NavigationItem[]> = derived(
        [activeChainFeatures],
        ([$activeChainFeatures]) => {
            // Items to include in the advanced section
            const items: NavigationItem[] = [];
            if ($activeChainFeatures) {
                if (
                    $activeChainFeatures.features.rex ||
                    $activeChainFeatures.features.fuel ||
                    $activeChainFeatures.features.powerup ||
                    $activeChainFeatures.features.staking
                ) {
                    items.push({
                        icon: "battery-charging",
                        name: "Resources",
                        path: "/resources",
                    });
                }
            }
            return items;
        },
    );
</script>

<MediaQuery query="(max-width: 999px)" let:matches>
    <NavigationContent
        {primaryNavigation}
        advancedNavigation={$advancedNavigation}
        floating={matches}
    />
</MediaQuery>

<style type="scss">
</style>
