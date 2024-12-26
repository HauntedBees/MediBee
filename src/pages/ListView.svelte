<script lang="ts">
    import dayjs from "dayjs";
    import db from "../lib/Data";
    import { FormatDosage, type MedicineTaken } from "../lib/Models";
    import { currentPatient } from "../lib/State";

    let amountToShow = 30;
    let takenList: (MedicineTaken | string)[] = [];

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
                takenList = [];
                let lastBreakpoint = 0; // unset, today, yesterday, this week, this month, older
                for(let i = 0; i < medicines.length; i++) {
                    const m = medicines[i];
                    const time = dayjs(m.timeTaken);
                    if(time.isSame(dayjs(), "day")) {
                        if(lastBreakpoint < 1) {
                            takenList.push("Today");
                            lastBreakpoint = 1;
                        }
                    } else if(time.isSame(dayjs().subtract(1, "day"), "day")) {
                        if(lastBreakpoint < 2) {
                            takenList.push("Yesterday");
                            lastBreakpoint = 2;
                        }
                    } else if(time.isSame(dayjs().startOf("week"), "week")) {
                        if(lastBreakpoint < 3) {
                            takenList.push("This Week");
                            lastBreakpoint = 3;
                        }
                    } else if(time.isSame(dayjs().startOf("month"), "month")) {
                        if(lastBreakpoint < 4) {
                            takenList.push("This Month");
                            lastBreakpoint = 4;
                        }
                    } else if(lastBreakpoint < 5) {
                        takenList.push("Older");
                        lastBreakpoint = 5;
                    }
                    takenList.push(m);
                }
            });
    }
    function GetDateFormat(m: MedicineTaken): string {
        const time = dayjs(m.timeTaken);
        const today = dayjs().startOf("day");
        const yesterday = today.subtract(1, "day");
        if(time.isSame(today, "day") || time.isSame(yesterday, "day")) {
            return time.format("h:mm A");
        } else {
            return time.format("MM/DD h:mm A")
        }
    }
</script>
<div class="px-4">
    {#each takenList as m}
        {#if typeof m === "string"}
            <h2 class="subtitle mb-1">{m}</h2>
        {:else}
            <div class="columns is-mobile {m.notes ? "" : "pb-4"}">
                <div class="column is-narrow">{GetDateFormat(m)}</div>
                <div class="column has-text-centered">{m.medicineName}</div>
                <div class="column is-narrow">{FormatDosage(m)}</div>
            </div>
            {#if m.notes}
            <div class="pb-4">{m.notes}</div>
            {/if}
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