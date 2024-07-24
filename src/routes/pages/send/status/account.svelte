<script lang="ts">
    import type { Name } from "@wharfkit/antelope";
    import Completed from "./template/completed.svelte";
    import { transferData, Step } from "../transfer";
    export let toAccount: Name;
    export let editable: boolean = false;

    function changeRecipient() {
        transferData.update((data) => ({
            ...data,
            step: Step.Recipient,
            backStep: data.step,
        }));
    }

    const changeStep = editable ? changeRecipient : undefined;
</script>

<Completed header="To" {changeStep}>
    <span>{toAccount}</span>
</Completed>
