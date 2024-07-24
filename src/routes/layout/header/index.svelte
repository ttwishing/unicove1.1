<script>
    import { activeSession } from "$lib/app/store";

    export let open = false;
</script>

{#if $$slots.submenu}
    <div class="submenu">
        <slot name="submenu" />
    </div>
{/if}
<div class="account-button">
    <span class="accounts">
        <span class="text">
            {#if $activeSession}
                {$activeSession?.auth.actor}
            {:else}
                Login
            {/if}
        </span>
    </span>
</div>

<style lang="scss">
    .account-button {
        display: flex;
        align-items: center;
        color: var(--main-blue);
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        margin: 0 6px 0 auto;
        .icon {
            color: var(--main-blue);
            line-height: 16px;
            margin-right: 10px;
            vertical-align: middle;
        }
    }
    .accounts {
        display: flex;
        align-items: center;
    }
    @media only screen and (max-width: 600px) {
        .account-button .accounts {
            .icon {
                margin-right: 0;
            }
            .text {
                display: none;
            }
        }
    }
</style>
