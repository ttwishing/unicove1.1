<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import { preferences } from "$lib/app/store";

    export let expand = true;
    export let floating = false;

    interface NavigationItem {
        exactPath?: boolean;
        icon: string;
        name: string;
        path: string;
    }

    export let primaryNavigation: NavigationItem[] = [];

    function handleNaviClick(item: NavigationItem) {}
</script>

<nav class:floating>
    <header>
        <div>Unicove</div>
    </header>
    <ul>
        {#each primaryNavigation as item}
            <li>
                <a href="" on:click={handleNaviClick(item)}>
                    <span class="name">{item.name}</span>
                </a>
            </li>
        {/each}
    </ul>
</nav>

<style lang="scss">
    nav {
        background-color: var(--main-grey);
        padding: 18px 26px;
        box-sizing: border-box;
        width: 268px;
        min-width: 268px;
        height: 100vh;
        :global(.darkmode) & {
            background-image: url("/images/nav-noise-dark.png");
        }
        header {
            display: flex;
            align-items: flex-start;
            height: 60px;
            border-bottom: 1px solid var(--divider-grey);
            .title {
                display: flex;
                flex: 1;
                flex-direction: column;
                margin-left: 12px;
                .unicove {
                    margin-bottom: 4px;
                }
                .version {
                    color: var(--dark-grey);
                    font-size: 10px;
                    line-height: 12px;
                }
            }
            .button {
                color: var(--main-blue);
                cursor: pointer;
                display: none;
            }
        }

        > ul {
            margin-top: 26px;
            > li {
                border-radius: 8px;
                margin-bottom: 8px;
                a {
                    color: var(--main-blue);
                    cursor: pointer;
                    display: flex;
                    text-decoration: none;
                    height: 32px;
                    align-items: center;
                    font-weight: 500;
                }
                &:hover {
                    background-color: var(--background-highlight-hover);
                }
                &.active {
                    background-color: var(--background-highlight);
                    border-radius: 8px;
                    a {
                        color: var(--main-black);
                    }
                }
                .icon {
                    padding: 8px;
                    :global(.icon) {
                        vertical-align: middle;
                    }
                }
                .name {
                    padding-left: 5px;
                }
                &.advanced {
                    cursor: pointer;
                    color: var(--dark-grey);
                    font-family: Inter;
                    font-style: normal;
                    font-weight: 600;
                    font-size: 10px;
                    line-height: 26px;
                    letter-spacing: 0.1px;
                    text-transform: uppercase;
                    margin-top: 27px;
                    .icon {
                        float: right;
                        padding: 0;
                        margin-right: 10px;
                        :global(.icon) {
                            vertical-align: middle;
                        }
                    }
                    &:hover {
                        background-color: transparent;
                    }
                }
                ul {
                    margin-top: 0;
                }
            }
        }

        // &.collapsed {
        //     width: 97px;
        //     min-width: 97px;
        //     header {
        //         justify-content: center;
        //     }
        //     ul li a {
        //         justify-content: center;
        //         .name {
        //             display: none;
        //         }
        //     }
        // }

        &.floating {
            position: absolute;
            z-index: 2001;
            top: 0;
            left: 0;
        }
    }
</style>
