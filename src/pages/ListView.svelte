<script lang="ts">
    import dayjs from "dayjs";
    import Magnify from "svelte-material-icons/Magnify.svelte";
    import db, { AnyStringMatch } from "../lib/Data";
    import { type MedicineTaken } from "../lib/Models";
    import { currentModal, currentPatient } from "../lib/State";
    import MedicineRow from "../components/MedicineRow.svelte";

    let amountToShow = 30;
    let takenList: (MedicineTaken | string)[] = [];

    let hasMore = true;
    let searchQuery = "";

    let currentPatientId = 0;
    currentPatient.subscribe((p) => {
        currentPatientId = p.id || 0;
        GetLatestTakens();
    });

    currentModal.subscribe((_) => {
        GetLatestTakens();
    });

    function ShowMore() {
        amountToShow += 30;
        GetLatestTakens();
    }

    function GetLatestTakens(reset = false) {
        if (reset) {
            hasMore = true;
        }
        db.taken
            .orderBy("timeTaken")
            .reverse()
            .filter((m) => {
                if (searchQuery.trim() === "") {
                    return true;
                }
                const safeQuery = searchQuery.trim().toLowerCase();
                const dateTaken = dayjs(m.timeTaken);
                const month = dateTaken.format("MMMM").toLowerCase();
                if (
                    AnyStringMatch([m.medicineName, m.notes, month], safeQuery)
                ) {
                    return true;
                }
                const maybeDate = dayjs(searchQuery);
                if (maybeDate.isValid()) {
                    return dateTaken.isSame(maybeDate, "day");
                }
                return false;
            })
            .limit(amountToShow)
            .and((m) => m.patientId === currentPatientId)
            .toArray()
            .then((medicines) => {
                if (medicines.length < amountToShow) {
                    hasMore = false;
                }
                takenList = [];
                let lastBreakpoint = 0; // unset, today, yesterday, this week, this month, older
                for (let i = 0; i < medicines.length; i++) {
                    const m = medicines[i];
                    const time = dayjs(m.timeTaken);
                    if (time.isSame(dayjs(), "day")) {
                        if (lastBreakpoint < 1) {
                            takenList.push("Today");
                            lastBreakpoint = 1;
                        }
                    } else if (time.isSame(dayjs().subtract(1, "day"), "day")) {
                        if (lastBreakpoint < 2) {
                            takenList.push("Yesterday");
                            lastBreakpoint = 2;
                        }
                    } else if (time.isSame(dayjs().startOf("week"), "week")) {
                        if (lastBreakpoint < 3) {
                            takenList.push("This Week");
                            lastBreakpoint = 3;
                        }
                    } else if (time.isSame(dayjs().startOf("month"), "month")) {
                        if (lastBreakpoint < 4) {
                            takenList.push("This Month");
                            lastBreakpoint = 4;
                        }
                    } else if (lastBreakpoint < 5) {
                        takenList.push("Older");
                        lastBreakpoint = 5;
                    }
                    takenList.push(m);
                }
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
            on:input={() => GetLatestTakens(true)}
        />
        <span class="icon is-small is-left">
            <Magnify />
        </span>
    </p>
</div>
<div class="px-2">
    {#each takenList as m}
        {#if typeof m === "string"}
            <h2 class="subtitle mb-2 mt-3">{m}</h2>
        {:else}
            <MedicineRow {m} allowShortDates={true} />
        {/if}
    {/each}
    {#if hasMore}
        <button class="button is-primary" on:click={ShowMore}>
            Show More
        </button>
    {/if}
</div>
