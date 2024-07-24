<script lang="ts">
    import Logo from "$lib/components/elements/logo.svelte";
    import Unicove from "$lib/components/elements/unicove.svelte";
    import MediaQuery from "$lib/components/utils/media-query.svelte";
    import Button from "$lib/components/elements/button.svelte";
    import Text from "$lib/components/elements/text.svelte";
    import Loginbutton from "./loginbutton.svelte";

    let creatingAccount = false;

    function handleCreateAccount(event: Event) {}

    async function createAccount() {}
</script>

<div class="container">
    <header>
        <div class="logo">
            <Logo width={40} variant="dark" />
            <div class="title">
                <div class="unicove">
                    <Unicove width={90} variant="dark" />
                </div>
                <div class="version">0.0.1</div>
            </div>
        </div>
        <div class="account">
            <MediaQuery query="(min-width: 536px)" let:matches>
                {#if matches}
                    <Button
                        style="tertiary"
                        size="regular"
                        on:action={handleCreateAccount}
                        disabled={creatingAccount}
                        ><Text>New Account</Text></Button
                    >
                {/if}
            </MediaQuery>
            <Loginbutton style="tertiary">Login</Loginbutton>
        </div>
    </header>
    <content>
        <h2>I am content</h2>
    </content>

    <footer>
        <h3>I am footer</h3>
    </footer>
</div>

<style lang="scss">
    .container {
        background-color: var(--color-bg-1);
        --padding: 30px;
        overflow: hidden;
        isolation: isolate;
        > * {
            margin: 0 auto;
            max-width: 1200px;
        }
        header {
            max-width: 950px;
        }
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 36px 10px 20px 10px;
        .logo {
            display: flex;
            .title {
                display: flex;
                flex: 1;
                flex-direction: column;
                margin-left: 12px;
                .unicove {
                    margin-bottom: 4px;
                }
                .version {
                    color: var(--middle-green-eagle);
                    font-size: 10px;
                    line-height: 12px;
                    :global(.darkmode) & {
                        color: #ffffff;
                    }
                }
            }
        }
        .account {
            display: grid;
            align-items: center;
            justify-content: space-between;
            grid-template-columns: repeat(3, auto);
            gap: 10px;
            @media (max-width: 535px) {
                grid-template-columns: repeat(2, auto);
            }
        }
    }
    content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
    }

    footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>
