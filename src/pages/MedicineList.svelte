<script lang="ts">
    import db from "../lib/Data";
    import icons from "../lib/Icons";
    import type { Medicine } from "../lib/Models";
    import { currentPage, currentPatient, currentTakenMedicine } from "../lib/State";
    let medicines: Medicine[];
    currentPatient.subscribe(c => {
        db.medicine.filter(m => m.patientId === c.id || m.patientId === 0).toArray().then((res) => {
            medicines = res;
        });
    });
    function onMedicineTapped(m: Medicine) {
        currentPage.set({
            displayName: m.name,
            route: "edit-medicine",
            backDisplayName: "Medicine List",
            backRoute: "medicine-list",
            data: { medicine: m },
        });
    }
</script>

{#each medicines as m}
    <div class="box columns is-mobile">
        <div class="column icon">
            <svelte:component this={icons[m.icon]} size="2rem" color={m.color} />
        </div>
        <span class="column">{m.name}</span>
        <div class="column has-text-right">
            <button on:click={() => onMedicineTapped(m)} class="button is-primary">Edit</button>
            <button on:click={() => currentTakenMedicine.set(m)} class="button is-success">Take</button>
        </div>
    </div>
{/each}