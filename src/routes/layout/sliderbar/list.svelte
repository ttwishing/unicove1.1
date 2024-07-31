<script lang="ts">
    import { login, logout } from "$lib/wharfkit/auth";

    import type { SerializedSession } from "@wharfkit/session";
    import { activeSession } from "$lib/wharfkit/auth";
    import { availableSessionGroup } from "$lib/wharfkit/auth";
    import { sessionEquals } from "$lib/wharfkit/auth";

    import Button from "$lib/components/elements/button.svelte";
    import ButtonLogin from "$lib/components/elements/button/login.svelte";
    import Icon from "$lib/components/elements/icon.svelte";
    import Segment from "$lib/components/elements/segment.svelte";
    import Text from "$lib/components/elements/text.svelte";

    $: isActive = (session: SerializedSession) =>
        sessionEquals(session, $activeSession);

    export let onSelect: (session: any) => void;

    function handleAdd() {
        login().catch((error: any) => {
            // TODO: some sort of modal or toast for error messages like these
            console.warn("unable to add account", error);
        });
    }

    export let collapsed: any = {};

    function toggle(chainId: string) {
        if (collapsed[chainId] !== true) {
            collapsed[chainId] = true;
        } else {
            collapsed[chainId] = false;
        }
    }
</script>

{#if $activeSession}
    <div class="list">
        <div class="add-account">
            <Button fluid style="primary" on:action={handleAdd}>
                <!-- <Icon name="user-plus" /> -->
                <Text>Add another account</Text>
            </Button>
        </div>
        {#each $availableSessionGroup as group}
            <div class="network">
                <div class="header" on:click={() => toggle(group.chainId)}>
                    <Text>{group.name} ({group.sessions.length})</Text>
                    <Icon
                        name={collapsed[group.chainId]
                            ? "chevron-right"
                            : "chevron-down"}
                    />
                </div>
                <ul class="accounts" class:collapsed={collapsed[group.chainId]}>
                    {#each group.sessions as session}
                        <li class:active={isActive(session)}>
                            <div
                                class="icon"
                                on:click={() => onSelect(session)}
                            >
                                <!-- <Icon
                                    name={isActive(session)
                                        ? "user-check"
                                        : "user"}
                                /> -->
                            </div>
                            <div
                                class="account"
                                on:click={() => onSelect(session)}
                            >
                                {session.actor}
                            </div>
                            <div
                                class="control"
                                on:click={() => logout(session)}
                            >
                                logout
                                <!-- <Icon name="log-out" size="large" /> -->
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
        {/each}
    </div>
{:else}
    <!-- <div class="login">
        <Segment>
            <div class="circular-icon">
                <Icon size="medium" name="user-check" />
            </div>
            <h3>Supported blockchains</h3>
            <p>
                {chains
                    .filter((chain) => !chain.testnet)
                    .map((chain) => chain.name)
                    .join(", ")}
            </p>
            <ButtonLogin>Login</ButtonLogin>
        </Segment>
    </div> -->
{/if}

<style lang="scss">
    $borderRadius: 8px;

    .list {
        margin: 10px;
        .add-account {
            padding: 0 16px;
        }
        .network {
            .header {
                color: var(--dark-grey);
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                font-weight: 600;
                line-height: 12px;
                padding: 6px 10px;
                margin-top: 26px;
                user-select: none;
            }
            .accounts {
                list-style-type: none;
                padding: 0 16px;
                &.collapsed {
                    display: none;
                }
                li {
                    cursor: pointer;
                    color: var(--main-blue);
                    display: flex;
                    font-size: 13px;
                    font-weight: 500;
                    line-height: 33px;
                    margin: 10px 0;
                    user-select: none;
                    text-decoration: none;
                    &.active {
                        background-color: var(--background-highlight);
                        color: var(--main-black);
                        border-radius: $borderRadius;
                        font-weight: 600;
                        > .icon,
                        > .control {
                            color: var(--main-blue);
                        }
                        .control {
                            display: flex;
                        }
                    }
                    > div {
                        order: 0;
                        flex: 0 1 auto;
                        &.icon {
                            color: var(--main-blue);
                            padding: 0 8px;
                            :global(.icon) {
                                vertical-align: middle;
                            }
                        }
                        &.account {
                            flex: 1 1 auto;
                            padding: 0 2px;
                            line-height: 32px;
                        }
                        &.control {
                            display: none;
                            align-items: center;
                            justify-content: center;
                            margin: 0 10px;
                        }
                    }
                }
            }
        }
        :global(.button) {
            line-height: 1em;
            // margin: 0 16px;
        }
    }

    .button {
        background-color: grey;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        font-size: 14px;
        border: 1px solid yellow;
        width: 100%;
        color: #000000;
        overflow: visible;
        cursor: pointer;
        padding: 10px 12px;
        position: relative;
        white-space: nowrap;
        text-decoration: none;
        .content {
            z-index: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            .text {
            }
        }
    }

    .login {
        margin: 0 26px;
        text-align: center;
        :global(.segment) {
            background: var(--background-highlight);
        }
        .circular-icon {
            background: var(--main-grey);
            border-radius: 50%;
            margin: 0 auto;
            position: relative;
            height: 48px;
            width: 48px;
            :global(.icon) {
                position: absolute;
                top: 12px;
                left: 12px;
                right: 12px;
                height: 24px;
                width: 24px;
            }
        }
        h3 {
            font-family: Inter;
            font-style: normal;
            font-weight: bold;
            font-size: 12px;
            line-height: 14px;
            letter-spacing: 0.01px;

            color: var(--main-black);
            margin-top: 15px;
        }
        p {
            font-family: Inter;
            font-style: normal;
            font-weight: 500;
            font-size: 10px;
            line-height: 14px;
            letter-spacing: 0.01px;

            color: #9898b5;
            margin: 7px 0 11px;
        }
    }
</style>
