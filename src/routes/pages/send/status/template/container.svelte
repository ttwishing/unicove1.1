<script lang="ts">
</script>

<div class="container">
    <slot />
</div>

<style lang="scss">
    .container {
        display: flex;
        min-height: 60px;
        border-bottom: 1px solid var(--divider-grey);
        align-items: center;
    }
</style>
