<script lang="ts">
    import Magnify from "svelte-material-icons/Magnify.svelte";
    import db, { AnyStringMatch } from "../lib/Data";
    import icons from "../lib/Icons";
    import type { Medicine } from "../lib/Models";
    import { currentPage, currentPatient, currentTakenMedicine } from "../lib/State";
    let medicines: Medicine[];
    let searchQuery = "";
    let currentPatientId = 0;
    currentPatient.subscribe(c => {
        currentPatientId = c.id || 0;
        Search();
    });
    function Search() {
        db.medicine
            .filter(m => {
                if(m.patientId !== currentPatientId && m.patientId !== 0) {
                    return false;
                }
                if(searchQuery.trim() === "") {
                    return true;
                }
                const safeQuery = searchQuery.trim().toLowerCase();
                return AnyStringMatch([
                    m.name, m.category, m.notes
                ], safeQuery);
            })
            .sortBy("name")
            .then(res => {
            medicines = res;
        });
    }
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
<div class="field">
    <p class="control has-icons-left">
        <input
            class="input"
            type="text"
            placeholder="Search"
            bind:value={searchQuery}
            on:input={Search}
        />
        <span class="icon is-small is-left">
            <Magnify />
        </span>
    </p>
</div>
{#each medicines as m}
    <div class="box columns mb-1 is-gapless is-vcentered is-mobile">
        <div class="column is-2 icon">
            <svelte:component this={icons[m.icon]} size="2rem" color={m.color} />
        </div>
        <span class="column is-5">{m.name}</span>
        <div class="column is-5 has-text-right">
            <button on:click={() => onMedicineTapped(m)} class="button is-small is-primary">Edit</button>
            <button on:click={() => currentTakenMedicine.set(m)} class="button is-small is-success">Take</button>
        </div>
    </div>
{/each}