<script lang="ts">
    import MedicineRow from "../components/MedicineRow.svelte";
    import db from "../lib/Data";
    import type { Medicine, MedicineTaken } from "../lib/Models";
    import { CloseModal, currentModal } from "../lib/State";

    let open = false;
    let medicineName = "Medicine";
    let medicineHistory: MedicineTaken[] = [];

    currentModal.subscribe((m) => {
        if (m?.name !== "history") {
            open = false;
            return;
        }
        open = true;
        const medicine: Medicine = m.data.medicine;
        const patientId: number = m.data.patientId;
        medicineName = medicine.name;
        db.taken
            .where("medicineId")
            .equals(medicine.id || 0)
            .and((c) => c.patientId === patientId)
            .toArray()
            .then((res) => {
                res.sort(
                    (a, b) => b.timeTaken.getTime() - a.timeTaken.getTime(),
                );
                medicineHistory = res;
            });
    });
</script>

{#if open}
    <header class="modal-card-head">
        <p class="modal-card-title">{medicineName} History</p>
        <button class="delete" aria-label="close" on:click={CloseModal}
        ></button>
    </header>
    <section class="modal-card-body">
        {#if medicineHistory}
            <div class="px-2">
                {#each medicineHistory as m}
                    <MedicineRow {m} />
                {/each}
            </div>
        {/if}
    </section>
    <footer class="modal-card-foot">
        <div class="buttons">
            <button class="button" on:click={CloseModal}>Close</button>
        </div>
    </footer>
{/if}
