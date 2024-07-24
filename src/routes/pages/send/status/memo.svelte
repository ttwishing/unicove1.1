<script lang="ts">
    import Completed from "./template/completed.svelte";
    import { Step, transferData } from "../transfer";
    export let memo: string | undefined;
    export let editable: boolean = false;
    function changeMemo() {
        transferData.update((data) => ({
            ...data,
            step: Step.Memo,
            backStep: data.step,
        }));
    }
    const changeStep = editable ? changeMemo : undefined;
</script>

<Completed header="Transation Memo" {changeStep}>
    <span>{memo ? memo : "(Optional)"}</span>
</Completed>

<style type="scss">
    span {
        line-height: 32px;
    }
</style>
