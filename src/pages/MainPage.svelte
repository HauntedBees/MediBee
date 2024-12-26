<script lang="ts">
    import { GetPatientMedicineInfo } from "../lib/Data";
    import icons from "../lib/Icons";
    import type { Medicine } from "../lib/Models";
    import { currentPatient, currentTakenMedicine } from "../lib/State";

    interface MedicineNote {
        medicine: Medicine;
        amountNeededToday: number;
    }

    let allAsNeededMedicines: Medicine[];
    let categories: string[];
    let medicinesToTakeToday: MedicineNote[];
    let currentMedicineSelection: Medicine[] | undefined;
    function OpenMedicine(m: Medicine) {
        currentTakenMedicine.set(m);
    }
    currentTakenMedicine.subscribe(m => {
        if(!m) { // Refresh on close
            GetMedicines();
        }
    });

    function FilterMedicines(category: string) {
        currentMedicineSelection = allAsNeededMedicines.filter(m => m.category == category);
    }

    function GetMedicines() {
        currentPatient.subscribe(async p => {
            const info = await GetPatientMedicineInfo(p.id || 0);
            allAsNeededMedicines = info.asNeededMedicines;
            categories = info.categories;
            medicinesToTakeToday = info.toTake;
        });
    }
    GetMedicines();
</script>

<h2 class="subtitle mb-1">Today</h2>
{#if medicinesToTakeToday && medicinesToTakeToday.length}
    <div class="block p-4">
        {#each medicinesToTakeToday as m}
        <div class="block is-fullwidth">
            <button class="card has-text-dark" style="background-color:{m.medicine.color}" on:click={() => OpenMedicine(m.medicine)}>
                <div class="block mb-2">
                    <svelte:component this={icons[m.medicine.icon]} size="2rem" />
                </div>
                <span class="subtitle has-text-dark has-text-weight-bold">
                    {m.medicine.name}
                    {#if m.amountNeededToday > 1}
                        ({m.amountNeededToday})
                    {/if}
                </span>
            </button>
        </div>
        {/each}
    </div>
{:else if !medicinesToTakeToday}
    Loading
{:else}
    <div class="block">You don't need to take any more medicine today.</div>
{/if}
{#if categories}
{#if currentMedicineSelection}
<h2 class="subtitle mb-1">
    {currentMedicineSelection[0].category || "Other"}
    <button class="button ml-4 is-info" on:click={()=>currentMedicineSelection = undefined}>Show All</button>
</h2>
<div class="block p-4 fixed-grid has-3-cols">
    <div class="grid">
        {#each currentMedicineSelection as m}
            <div class="block is-fullwidth">
                <button class="card has-text-dark" style="background-color:{m.color}" on:click={() => OpenMedicine(m)}>
                    <div class="block mb-2">
                        <svelte:component this={icons[m.icon]} size="2rem" />
                    </div>
                    <span class="subtitle has-text-dark has-text-weight-bold">
                        {m.name}
                    </span>
                </button>
            </div>
        {/each}
    </div>
</div>
{:else}
<h2 class="subtitle mb-1">General</h2>
<div class="block p-4 fixed-grid has-3-cols">
    <div class="grid">
        {#each categories as c}
            <button
                on:click={() => FilterMedicines(c)}
                class="cell card has-background-info has-text-black mx-2 mb-0"
            >
                {c || "Other"}
            </button>
        {/each}
    </div>
</div>
{/if}
{/if}

<style>
    .card {
        width: 100%;
        height: 120px;
    }
</style>