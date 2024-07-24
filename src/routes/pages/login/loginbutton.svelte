<script lang="ts">
    import { login } from "$lib/app/auth";
    import Button from "$lib/components/elements/button.svelte";
    import Text from "$lib/components/elements/text.svelte";
    import { addToast } from "$lib/stores/toast";

    let disabled = false;
    export let asLink = false;
    export let style:
        | "default"
        | "primary"
        | "secondary"
        | "tertiary"
        | "no-frame"
        | "effect" = "secondary";

    function loginHandler() {
        disabled = true;
        login()
            .catch((err) => {
                console.log("loginHander, cache");
                addToast({ title: "Unable to login", message: err.message });
            })
            .finally(() => {
                console.log("loginHander, finnal");
                disabled = false;
            });
    }
</script>

{#if asLink}
    <a href={undefined} on:click={loginHandler}><slot /></a>
{:else}
    <div class="login">
        <Button {disabled} size="regular" {style} on:action={loginHandler}>
            <Text><slot /></Text>
        </Button>
    </div>
{/if}

<style lang="scss">
    .login {
        display: flex;
        flex-direction: column;
        justify-items: center;
        align-content: center;
        justify-content: center;
        align-items: center;
    }
</style>
