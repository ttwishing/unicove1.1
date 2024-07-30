<script lang="ts">
    import { activeBlockchain, currentAccount } from "$lib/app/store";

    import Button from "$lib/components/elements/button.svelte";
    import Icon from "$lib/components/elements/icon.svelte";
    import Text from "$lib/components/elements/text.svelte";
    import Clipboard from "$lib/components/elements/clipboard.svelte";
</script>

{#if $currentAccount}
    <div class="container">
        <h2>{$currentAccount.account_name}</h2>
        <Clipboard text={$currentAccount.account_name} let:copy>
            <Button on:action={copy} style="primary">
                <!-- <Icon name="clipboard" /> -->
                <Text>Copy to clipboard</Text>
            </Button>
        </Clipboard>
        <p>
            To receive tokens on {$activeBlockchain.name}, send them directly to
            your account name as shown above.
        </p>
    </div>
{/if}

<style lang="scss">
    .container {
        text-align: center;
    }
    h2,
    p {
        line-height: 2em;
    }
    h2 {
        color: var(--black);
        font-size: 2em;
        margin: 0.5em 0;
    }
    p {
        color: var(--dark-grey);
        margin-top: 1em;
    }
</style>
