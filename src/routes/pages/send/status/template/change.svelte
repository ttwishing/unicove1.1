<script lang="ts">
    import Icon from "$lib/components/elements/icon.svelte";
    export let changeStep: () => void;
</script>

<div on:click={changeStep}>
    <Icon size="large" name="edit-2" />
</div>

<style lang="scss">
    div {
        color: var(--main-blue);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 16px 0 16px 16px;
    }
</style>
