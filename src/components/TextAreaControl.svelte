<script lang="ts">
    export let name = "Name";
    export let placeholder = "Empty";
    $: id = name.toLowerCase().replace(/\s/g, "-");
    export let value = "";
</script>

<div class="form-control">
    <label for={id}>{name}</label>
    <textarea class="textarea" {id} bind:value {placeholder}></textarea>
</div>