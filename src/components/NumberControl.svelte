<script lang="ts">
    export let name = "Name";
    export let placeholder = "Empty";
    export let inline = false;
    $: id = name.toLowerCase().replace(/\s/g, "-");
    export let value = 0;
</script>

<div class="form-control {inline ? 'inline' : ''}">
    <label for={id}>{name}</label>
    <input {id} bind:value type="number" {placeholder} />
</div>

<style>
    input {
        margin-top: 4px;
    }
</style>
