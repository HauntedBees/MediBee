<script lang="ts">
    import dayjs from "dayjs";
    import TextAreaControl from "../components/TextAreaControl.svelte";
    import db from "../lib/Data";
    import { FormatDosage, type Medicine } from "../lib/Models";
    import { currentPatient, currentTakenMedicine } from "../lib/State";

    const dosages = [0.25, 0.5, 1, 2, 3, 4, 5];

    let currentPatientId = 0;
    currentPatient.subscribe((patient) => (currentPatientId = patient.id || 0));

    let amountToTake = 1, amountIdx = 2;
    let currentTime = dayjs().format("YYYY-MM-DDTHH:mm");
    let notes = "";

    let medicine: Medicine | undefined;
    currentTakenMedicine.subscribe(m => {
        medicine = m;
        amountIdx = 2;
        amountToTake = 1;
        currentTime = dayjs().format("YYYY-MM-DDTHH:mm");
        notes = "";
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
        db.taken.add({
            patientId: currentPatientId,
            medicineId: medicine.id || 0,
            medicineName: medicine.name,
            dosageAmount: medicine.dosageAmount * amountToTake,
            dosageUnit: medicine.dosageUnit,
            timeTaken: dayjs(currentTime).toDate(),
            notes: notes,
        }).then(CloseModal);
    }
    function CloseModal() {
        currentTakenMedicine.set(undefined);
    }
</script>

{#if medicine}
    <div class="modal {medicine ? 'is-active' : ''}">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Taking {medicine.name}</p>
                <button class="delete" aria-label="close" on:click={CloseModal}></button>
            </header>
            <section class="modal-card-body">
                <div class="p-4">
                    <div class="columns is-mobile">
                        <strong class="column">Single Dose: </strong>
                        <span class="column">{FormatDosage(medicine)}</span>
                        <strong class="column">This Dose: </strong>
                        <span class="column">{FormatDosage({ dosageAmount: medicine.dosageAmount * amountToTake, dosageUnit: medicine.dosageUnit })}</span>
                    </div>
                    <div class="block has-text-centered">
                        <button
                            class="button is-large {amountToTake == 0.25 ? '' : 'is-primary'}"
                            on:click={() => AdjustAmount(-1)}>-</button
                        >
                        <span class="button is-large mx-2">{amountToTake}</span>
                        <button
                            class="button is-large is-primary"
                            on:click={() => AdjustAmount(1)}>+</button
                        >
                    </div>
                    <div class="field">
                        <label for="time">Time</label>
                        <input
                            class="input"
                            id="time"
                            bind:value={currentTime}
                            type="datetime-local"
                        />
                    </div>
                    <TextAreaControl name="Notes" bind:value={notes} />
                </div>
            </section>
            <footer class="modal-card-foot">
                <div class="buttons">
                    <button class="button is-success" on:click={TakeMedicine}>Take</button>
                    <button class="button" on:click={CloseModal}>Cancel</button>
                </div>
            </footer>
        </div>
    </div>
{/if}