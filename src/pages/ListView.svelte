<script lang="ts">
    import dayjs from "dayjs";
    import db from "../lib/Data";
    import { FormatDosage, type MedicineTaken } from "../lib/Models";
    import { currentPatient } from "../lib/State";

    let amountToShow = 30;
    let takenList: MedicineTaken[] = [];

    let hasMore = true;

    let currentPatientId = 0;
    currentPatient.subscribe(p => {
        currentPatientId = p.id || 0;
        GetLatestTakens();
    });

    function ShowMore() {
        amountToShow += 30;
        GetLatestTakens();
    }

    function GetLatestTakens() {
        db.taken
            .orderBy("timeTaken")
            .reverse()
            .limit(amountToShow)
            .and(m => m.patientId === currentPatientId)
            .toArray()
            .then(medicines => {
                if(medicines.length < amountToShow) {
                    hasMore = false;
                }
                takenList = medicines;
            });
    }
</script>
<div class="px-4">
    {#each takenList as m}
    <div class="columns is-mobile {m.notes ? "" : "pb-4"}">
        <div class="column is-narrow">{dayjs(m.timeTaken).format("MM/DD h:mm A")}</div>
        <div class="column has-text-centered">{m.medicineName}</div>
        <div class="column is-narrow">{FormatDosage(m)}</div>
    </div>
    {#if m.notes}
    <div class="pb-4">{m.notes}</div>
    {/if}
    {/each}
    {#if hasMore}
        <button class="button is-primary" on:click={ShowMore}>
            Show More
        </button>
    {/if}
</div>
<style>
    .columns {
        margin-bottom: 0;
    }
    .column {
        padding-bottom: 0;
    }
</style>