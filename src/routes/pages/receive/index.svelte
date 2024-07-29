<script lang="ts">
    import TransferReceive from "./receive.svelte";
    import Page from "../dashboard/page.svelte";
</script>

<Page divider={false}>
    <div class="container">
        <div class="header">Receive tokens</div>
        <div class="subheader">Use your account name</div>
        <TransferReceive />
    </div>
</Page>

<style lang="scss">
    .container {
        margin: 0 auto;
        max-width: 28rem;
    }
    .header {
        color: var(--black);
        font-family: Inter;
        font-style: normal;
        font-weight: bold;
        font-size: 24px;
        line-height: 29px;
        text-align: center;
        letter-spacing: -0.47px;
        margin-bottom: 7px;
    }
    .subheader {
        color: var(--dark-grey);
        font-family: Inter;
        font-style: normal;
        font-weight: normal;
        font-size: 16px;
        line-height: 19px;
        text-align: center;
        letter-spacing: -0.18px;
    }
</style>
