<script lang="ts">
    import type { Readable } from "svelte/store";
    import { derived } from "svelte/store";

    import { resourceFeatures } from "$lib/app/config";

    import MediaQuery from "$lib/components/utils/media-query.svelte";
    import NavigationContent from "./content.svelte";

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
    ];
</script>

<MediaQuery query="(max-width: 999px)" let:matches>
    <NavigationContent {primaryNavigation} floating={matches} />
</MediaQuery>

<style type="scss">
</style>
