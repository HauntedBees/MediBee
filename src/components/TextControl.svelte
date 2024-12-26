<script lang="ts">
    export let name = "Name";
    export let placeholder = "Empty";
    export let inline = false;
    $: id = name.toLowerCase().replace(/\s/g, "-");
    export let value = "";
</script>

<div class="form-control {inline ? 'inline' : ''}">
    <label for={id}>{name}</label>
    <input class="input mt-1 mb-2" {id} bind:value type="text" {placeholder} />
</div>