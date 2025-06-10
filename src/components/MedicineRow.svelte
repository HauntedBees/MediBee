<script lang="ts">
    import NoteEdit from "svelte-material-icons/NoteEdit.svelte";
    import {
        FormatDosage,
        MEDICINE_NOTE_ID,
        type MedicineTaken,
    } from "../lib/Models";
    import dayjs from "dayjs";
    import { OpenModal } from "../lib/State";

    export let m: MedicineTaken;
    export let allowShortDates = false;

    function GetTestResultColor(m: MedicineTaken): string {
        const result = (m.notes.split(";")[1] || "").toLowerCase();
        switch (result) {
            case "negative":
            case "passed":
            case "pass":
                return "health-good";
            case "positive":
            case "failed":
            case "fail":
                return "health-bad";
            default:
                return "";
        }
    }

    function GetTemperatureColor(m: MedicineTaken): string {
        const tempString = m.notes.split(";")[0];
        const temp = parseFloat(tempString);
        if (tempString.endsWith("F")) {
            if (temp <= 95) {
                return "health-bad";
            } else if (temp < 97) {
                return "health-warn";
            } else if (temp >= 102.2) {
                return "health-bad";
            } else if (temp >= 99.1) {
                return "health-warn";
            } else {
                return "health-good";
            }
        } else if (tempString.endsWith("C")) {
            if (temp <= 35) {
                return "health-bad";
            } else if (temp < 36.1) {
                return "health-warn";
            } else if (temp >= 39) {
                return "health-bad";
            } else if (temp >= 37.2) {
                return "health-warn";
            } else {
                return "health-good";
            }
        }
        return "";
    }

    function GetFormatTemperature(m: MedicineTaken): string {
        const tempString = m.notes.split(";")[0];
        if (tempString.endsWith("°F") || tempString.endsWith("°C")) {
            return tempString;
        } else if (tempString.endsWith("F")) {
            return tempString.replace("F", "°F");
        } else if (tempString.endsWith("C")) {
            return tempString.replace("C", "°C");
        } else if (tempString.endsWith("°")) {
            return tempString;
        } else {
            return tempString + "°";
        }
    }

    function GetNotes(m: MedicineTaken): string {
        if (m.medicineId !== MEDICINE_NOTE_ID) {
            return m.notes;
        }
        switch (m.medicineName) {
            case "Symptom":
            case "Misc. Notes":
                return "";
            case "Test Result":
                const splitNotes = m.notes.split(";");
                return splitNotes.slice(2).join(";");
            case "Temperature":
                return m.notes.split(/;(.*)/g)[1];
            default:
                return m.notes;
        }
    }

    function GetDateFormat(m: MedicineTaken): string {
        const time = dayjs(m.timeTaken);
        const today = dayjs().startOf("day");
        const yesterday = today.subtract(1, "day");
        const potentialYearSuffix = time.isSame(today, "year") ? "" : "/YY";
        let timeDisplay = "";
        if (m.approximateTime) {
            const timeDay = time.startOf("day");
            if (time.isBefore(timeDay.add(6, "hour"))) {
                // before 6AM
                timeDisplay = "Late Night";
            } else if (time.isBefore(timeDay.add(12, "hour"))) {
                // before 12PM
                timeDisplay = "Morning";
            } else if (time.isBefore(timeDay.add(16, "hour"))) {
                // before 4PM
                timeDisplay = "Afternoon";
            } else if (time.isBefore(timeDay.add(20, "hour"))) {
                // before 8PM
                timeDisplay = "Evening";
            } else {
                timeDisplay = "Night";
            }
        }
        if (
            allowShortDates &&
            (time.isSame(today, "day") || time.isSame(yesterday, "day"))
        ) {
            return m.approximateTime ? timeDisplay : time.format("h:mm A");
        } else {
            return m.approximateTime
                ? `${time.format(`MM/DD${potentialYearSuffix}`)} ${timeDisplay}`
                : time.format(`MM/DD${potentialYearSuffix} h:mm A`);
        }
    }
</script>

<div
    class="columns is-gapless is-vcentered is-mobile mb-0 {GetNotes(m)
        ? ''
        : 'pb-4'}"
>
    <div class="column is-3 is-size-8">{GetDateFormat(m)}</div>
    {#if m.medicineId === MEDICINE_NOTE_ID && (m.medicineName === "Symptom" || m.medicineName === "Misc. Notes")}
        <div class="column is-8 is-size-7">
            {m.notes}
        </div>
    {:else}
        <div class="column is-6">
            <span class="pl-1">
                {#if m.medicineId === MEDICINE_NOTE_ID && m.medicineName === "Test Result"}
                    {m.notes.split(";")[0]}
                {:else}
                    {m.medicineName}
                {/if}
            </span>
        </div>
        <div class="column is-2 is-size-8">
            {#if m.medicineId === MEDICINE_NOTE_ID && m.medicineName === "Temperature"}
                <span class={GetTemperatureColor(m)}>
                    {GetFormatTemperature(m)}
                </span>
            {:else if m.medicineId === MEDICINE_NOTE_ID && m.medicineName === "Test Result"}
                <span class={GetTestResultColor(m)}>
                    {m.notes.split(";")[1]}
                </span>
            {:else if m.medicineId !== MEDICINE_NOTE_ID}
                {FormatDosage(m)}
            {/if}
        </div>
    {/if}
    <div class="column is-1 has-text-right">
        <button
            on:click={() => OpenModal("take", { medicine: m })}
            class="button px-2 py-1 is-info is-small"
        >
            <span class="icon is-small">
                <NoteEdit />
            </span>
        </button>
    </div>
</div>
{#if GetNotes(m)}
    <div class="pb-4 is-size-7">{GetNotes(m)}</div>
{/if}

<style>
    .columns {
        margin-bottom: 0;
    }
    .column {
        padding-bottom: 0;
    }
    .health-good {
        color: #94ce95;
    }
    .health-warn {
        color: #ceb094;
    }
    .health-bad {
        color: #dd8998;
    }
    .is-size-8 {
        margin-top: 3px !important;
        font-weight: bold;
        font-size: 0.6rem;
    }
</style>
