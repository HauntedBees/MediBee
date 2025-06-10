<script lang="ts">
    import Magnify from "svelte-material-icons/Magnify.svelte";
    import PlusThick from "svelte-material-icons/PlusThick.svelte";
    import db, { AnyStringMatch } from "../lib/Data";
    import type { Medicine } from "../lib/Models";
    import { currentPatient, NavTo } from "../lib/State";
    import MedicineListItem from "../components/MedicineListItem.svelte";
    let myMedicines: Medicine[] = [];
    let allMedicines: Medicine[] = [];
    let searchQuery = "";
    let currentPatientId = 0;
    let currentPatientName = "";
    currentPatient.subscribe((c) => {
        currentPatientId = c.id || 0;
        if (c) {
            currentPatientName = c.name.endsWith("s")
                ? `${c.name}'`
                : `${c.name}'s`;
        } else {
            currentPatientName = "My";
        }
        Search();
    });
    function Search() {
        db.medicine
            .filter((m) => {
                if (m.patientId !== currentPatientId && m.patientId !== 0) {
                    return false;
                }
                if (searchQuery.trim() === "") {
                    return true;
                }
                const safeQuery = searchQuery.trim().toLowerCase();
                return AnyStringMatch([m.name, m.category, m.notes], safeQuery);
            })
            .sortBy("name")
            .then((res) => {
                myMedicines = res.filter(
                    (m) => m.patientId == currentPatientId,
                );
                allMedicines = res.filter((m) => m.patientId == 0);
            });
    }
</script>

<div class="columns is-mobile is-gapless is-vcentered mx-4">
    <div class="column is-11">
        <div class="field mr-2">
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
    </div>
    <div class="column is-1">
        <button
            class="button is-primary is-fullwidth"
            on:click={() => NavTo("New Medicine", "edit-medicine")}
        >
            <span class="icon">
                <PlusThick />
            </span>
        </button>
    </div>
</div>
{#if myMedicines.length}
    <h2 class="subtitle">{currentPatientName} Medicines</h2>
    {#each myMedicines as medicine}
        <MedicineListItem {medicine} patientId={currentPatientId} />
    {/each}
{/if}
{#if allMedicines.length}
    <h2 class="subtitle">All Medicines</h2>
    {#each allMedicines as medicine}
        <MedicineListItem {medicine} patientId={currentPatientId} />
    {/each}
{/if}
{#if !allMedicines.length && !myMedicines.length}
    <div class="my-4 mx-3">
        {#if searchQuery}
            No results for "{searchQuery}" If you want to add a new medicine,
            press the add button above.
        {:else}
            No medicines have been added yet. To add a new medicine, press the
            add button above.
        {/if}
    </div>
{/if}
