<script>
    export let open = false;
</script>

<slider class:open>
    <div class="header">Accounts</div>
    <!-- <List {onSelect} /> -->
</slider>

<style lang="scss">
    slider {
        display: block;
        position: fixed;
        right: 0;
        top: 0;
        height: 100%;
        max-height: 100vh;
        width: 268px;
        max-width: 300px;
        overflow-x: hidden;
        overflow-y: scroll;
        background-color: var(--main-grey);
        border-color: var(--main-grey);
        border-right-width: 2px;
        z-index: 1001;
    }
    .header {
        border-bottom: 1px solid var(--divider-grey);
        color: var(--dark-grey);
        line-height: 16px;
        margin: 24px;
        padding-bottom: 21px;
        .icon {
            vertical-align: middle;
            color: var(--main-blue);
        }
    }
    .header a {
        cursor: pointer;
        margin-right: 5px;
        margin-bottom: -10px;
    }
</style>
