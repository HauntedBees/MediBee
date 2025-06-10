<script lang="ts">
    import CalendarSearch from "svelte-material-icons/CalendarSearch.svelte";
    import HandHeart from "svelte-material-icons/HandHeart.svelte";
    import NoteEdit from "svelte-material-icons/NoteEdit.svelte";
    import icons from "../lib/Icons";
    import type { Medicine } from "../lib/Models";
    import { NavTo, OpenModal } from "../lib/State";
    export let medicine: Medicine;
    export let patientId: number;
    function onMedicineTapped(m: Medicine) {
        NavTo(m.name, "edit-medicine", { medicine: m });
    }
</script>

<div class="columns px-2 is-gapless is-vcentered is-mobile">
    <div class="column is-2 icon">
        <svelte:component
            this={icons[medicine.icon]}
            size="2rem"
            color={medicine.color}
        />
    </div>
    <span class="column is-5">{medicine.name}</span>
    <div class="column is-5 has-text-right">
        <button
            on:click={() => onMedicineTapped(medicine)}
            class="button is-small is-info"
        >
            <span class="icon is-small">
                <NoteEdit />
            </span>
        </button>
        <button
            on:click={() =>
                OpenModal("history", {
                    medicine: medicine,
                    patientId: patientId,
                })}
            class="button is-small is-primary"
        >
            <span class="icon is-small">
                <CalendarSearch />
            </span>
        </button>
        <button
            on:click={() => OpenModal("take", { medicine: medicine })}
            class="button is-small is-link"
        >
            <span class="icon is-small">
                <HandHeart />
            </span>
        </button>
    </div>
</div>
<hr />
