<script lang="ts">
    import dayjs from "dayjs";
    import TextAreaControl from "../components/TextAreaControl.svelte";
    import db from "../lib/Data";
    import {
        FormatDosage,
        GetNotes,
        MEDICINE_NOTE_ID,
        type Medicine,
    } from "../lib/Models";
    import { CloseModal, currentModal, currentPatient } from "../lib/State";
    import TextControl from "../components/TextControl.svelte";

    const dosages = [0.25, 0.5, 1, 2, 3, 4, 5];

    let currentPatientId = 0;
    currentPatient.subscribe((patient) => (currentPatientId = patient.id || 0));

    let editId = 0;
    let amountToTake = 1,
        amountIdx = 2;
    let timeIsApprox = false;
    let currentTime = dayjs().format("YYYY-MM-DDTHH:mm");
    let customAdditionalNotes = "";
    let customAdditionalNotes2 = "";
    let notes = "";

    let medicine: Medicine | undefined;
    currentModal.subscribe((d) => {
        if (d?.name !== "take") {
            medicine = undefined;
            return;
        }
        const m = d.data.medicine;
        customAdditionalNotes = "";
        customAdditionalNotes2 = "";
        if (!m || "frequency" in m) {
            medicine = m;
            editId = 0;
            amountIdx = 2;
            amountToTake = 1;
            currentTime = dayjs().format("YYYY-MM-DDTHH:mm");
            notes = "";
            timeIsApprox = false;
        } else if (m.medicineId === MEDICINE_NOTE_ID) {
            const potentialNote = GetNotes().find(
                (n) => m.medicineName === n.name,
            );
            if (!potentialNote) {
                return;
            }
            medicine = potentialNote;
            editId = m.id || 0;
            amountToTake = 1;
            amountIdx = 2;
            currentTime = dayjs(m.timeTaken).format("YYYY-MM-DDTHH:mm");
            timeIsApprox = false;
            if (potentialNote.name === "Temperature") {
                const splitNotes = m.notes.split(/;(.*)/g);
                notes = splitNotes[1];
                customAdditionalNotes = splitNotes[0];
            } else if (potentialNote.name === "Test Result") {
                const splitNotes = m.notes.split(";");
                customAdditionalNotes = splitNotes.shift() || "";
                customAdditionalNotes2 = splitNotes.shift() || "";
                notes = splitNotes.join(";");
            } else {
                notes = m.notes;
            }
        } else {
            db.medicine.get(m.medicineId).then((mm) => {
                if (!mm) {
                    return;
                }
                medicine = mm;
                editId = m.id || 0;
                const baseAmountToTake = m.dosageAmount / mm.dosageAmount;
                amountToTake = Math.round(baseAmountToTake * 4) / 4;
                amountIdx = dosages.indexOf(amountToTake);
                timeIsApprox = m.approximateTime || false;
                if (amountIdx < 0) {
                    amountIdx = 2;
                }
                currentTime = dayjs(m.timeTaken).format("YYYY-MM-DDTHH:mm");
                notes = m.notes;
            });
        }
    });

    function AdjustAmount(idxOffset: number) {
        const adjusted = amountIdx + idxOffset;
        amountIdx = Math.max(0, Math.min(dosages.length - 1, adjusted));
        amountToTake = dosages[amountIdx];
    }
    function TakeMedicine() {
        if (!medicine) {
            return;
        }
        const loggedNotes = customAdditionalNotes2
            ? `${customAdditionalNotes};${customAdditionalNotes2};${notes}`
            : customAdditionalNotes
              ? `${customAdditionalNotes};${notes}`
              : notes;
        if (editId) {
            db.taken
                .update(editId, {
                    id: editId,
                    patientId: currentPatientId,
                    medicineId: medicine.id || 0,
                    medicineName: medicine.name,
                    dosageAmount: medicine.dosageAmount * amountToTake,
                    dosageUnit: medicine.dosageUnit,
                    timeTaken: dayjs(currentTime).toDate(),
                    approximateTime: timeIsApprox,
                    notes: loggedNotes,
                })
                .then(CloseModal);
        } else {
            db.taken
                .add({
                    patientId: currentPatientId,
                    medicineId: medicine.id || 0,
                    medicineName: medicine.name,
                    dosageAmount: medicine.dosageAmount * amountToTake,
                    dosageUnit: medicine.dosageUnit,
                    timeTaken: dayjs(currentTime).toDate(),
                    approximateTime: timeIsApprox,
                    notes: loggedNotes,
                })
                .then(CloseModal);
        }
    }
    function DeleteMedicine() {
        if (confirm("Are you sure?")) {
            db.taken.delete(editId).then(CloseModal);
        }
    }
</script>

{#if medicine}
    <div class="modal {medicine ? 'is-active' : ''}">
        <div
            class="modal-background"
            role="presentation"
            on:click={CloseModal}
        ></div>
        <div class="modal-card">
            <header class="modal-card-head">
                {#if medicine.category === "Notes"}
                    <p class="modal-card-title">Logging {medicine.name}</p>
                {:else}
                    <p class="modal-card-title">Taking {medicine.name}</p>
                {/if}
                <button class="delete" aria-label="close" on:click={CloseModal}
                ></button>
            </header>
            <section class="modal-card-body">
                <div class="p-4">
                    {#if medicine.category !== "Notes"}
                        <div class="columns is-mobile">
                            <strong class="column">Single Dose: </strong>
                            <span class="column">{FormatDosage(medicine)}</span>
                            <strong class="column">This Dose: </strong>
                            <span class="column"
                                >{FormatDosage({
                                    dosageAmount:
                                        medicine.dosageAmount * amountToTake,
                                    dosageUnit: medicine.dosageUnit,
                                })}</span
                            >
                        </div>
                        <div class="block has-text-centered">
                            <button
                                class="button is-large {amountToTake == 0.25
                                    ? ''
                                    : 'is-primary'}"
                                on:click={() => AdjustAmount(-1)}>-</button
                            >
                            <span class="button is-large mx-2"
                                >{amountToTake}</span
                            >
                            <button
                                class="button is-large is-primary"
                                on:click={() => AdjustAmount(1)}>+</button
                            >
                        </div>
                    {/if}
                    <div class="field">
                        <label for="time">
                            Time
                            <span class="pl-6 is-size-7">
                                <input
                                    type="checkbox"
                                    bind:checked={timeIsApprox}
                                    class="mr-1"
                                /> Approximate</span
                            >
                        </label>
                        <input
                            class="input"
                            id="time"
                            bind:value={currentTime}
                            type="datetime-local"
                        />
                    </div>
                    {#if medicine.id === MEDICINE_NOTE_ID && medicine.name === "Temperature"}
                        <TextControl
                            name="Temperature"
                            bind:value={customAdditionalNotes}
                        />
                    {/if}
                    {#if medicine.id === MEDICINE_NOTE_ID && medicine.name === "Test Result"}
                        <TextControl
                            name="Test"
                            bind:value={customAdditionalNotes}
                        />
                        <TextControl
                            name="Result"
                            bind:value={customAdditionalNotes2}
                        />
                    {/if}
                    {#if medicine.notes}
                        <div class="mb-2">
                            <div>Details</div>
                            <div class="mx-2">{medicine.notes}</div>
                        </div>
                    {/if}
                    <TextAreaControl name="Notes" bind:value={notes} />
                </div>
            </section>
            <footer class="modal-card-foot">
                <div class="buttons">
                    <button class="button is-success" on:click={TakeMedicine}>
                        {#if medicine.id === MEDICINE_NOTE_ID}
                            Save
                        {:else}
                            Take
                        {/if}
                    </button>
                    <button class="button" on:click={CloseModal}>Cancel</button>
                    {#if editId}
                        <button
                            class="button is-warning ml-6"
                            on:click={DeleteMedicine}>Delete</button
                        >
                    {/if}
                </div>
            </footer>
        </div>
    </div>
{/if}
