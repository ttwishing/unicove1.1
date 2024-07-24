<script lang="ts">
    import { activeSession } from "$lib/app/store";
    import AccountSidebar from "./layout/sliderbar/index.svelte";
    import NavigationBar from "./layout/navigation/index.svelte";
    import Header from "./layout/header/index.svelte";

    /** Title of the page. */
    export let title: string = "";
    export let subtitle: string = "";

    /** Whether or not to show the left navigation */
    export let displayNavigation = true;

    /** Whether or not to show the divider after the page title */
    export let divider = true;

    let accountSidebar = false;
    let navigationSidebar = false;
</script>

<div
    class="grid"
    class:navigation={accountSidebar || navigationSidebar}
    class:withoutsidebar={!displayNavigation || !$activeSession}
    class:noRowGap={!divider}
>
    <div class="page-leftbar">
        <NavigationBar />
    </div>

    <div class="page-header">
        <Header></Header>
    </div>

    <div class="page-rightbar">
        <AccountSidebar />
    </div>

    <div class="page-main">
        <div class="content">
            <slot />
        </div>
    </div>
</div>

<style lang="scss">
    $grid_gap: 4em;
    $navigation_width: 268px;
    $slider_width: 268px;
    $menubar_height: 78px;
    $bottom_padding: 4em;

    .grid {
        display: grid;
        column-gap: $grid_gap;
        row-gap: calc(#{$grid_gap} / 2);

        grid-template-columns: $navigation_width auto $slider_width;
        grid-template-rows: $menubar_height minmax(0, auto);
        grid-template-areas:
            "leftbar header rightbar"
            "leftbar main rightbar";
    }

    .page-header {
        display: flex;
        grid-area: header;
        position: fixed;
        z-index: 1000;
        top: 0;
        left: calc(#{$navigation_width} + #{$grid_gap});
        right: calc(100vh - #{$slider_width} - #{$grid_gap});
        height: $menubar_height;
        background: var(--main-white);
        &.divider {
            border-bottom: 1px solid var(--divider-grey);
        }
    }

    .page-leftbar {
        min-height: 100vh;
        grid-area: leftbar;
        position: fixed;
        left: 0;
    }

    .page-rightbar {
        min-height: 100vh;
        grid-area: rightbar;
        position: fixed;
        right: 0;
    }

    .page-main {
        min-height: calc(100vh - #{$menubar_height} - #{$bottom_padding});
        padding-bottom: $bottom_padding;
        grid-area: main;
        > * {
            margin: 0 auto;
            max-width: 1200px;
        }

        .content {
        }
    }
</style>
