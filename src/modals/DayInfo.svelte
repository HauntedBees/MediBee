<script lang="ts">
    import dayjs from "dayjs";
    import { CloseModal, currentModal } from "../lib/State";
    import type { MedicineTaken } from "../lib/Models";
    import MedicineRow from "../components/MedicineRow.svelte";

    let open = false;
    let currentDayBeingViewed = "";
    let currentDayMedicines: MedicineTaken[] = [];
    currentModal.subscribe((m) => {
        if (m?.name !== "day") {
            open = false;
            return;
        }
        open = true;
        currentDayBeingViewed = m.data.currentDayBeingViewed;
        currentDayMedicines = m.data.currentDayMedicines;
    });
</script>

{#if open}
    <header class="modal-card-head">
        <p class="modal-card-title">
            {dayjs(currentDayBeingViewed).format("MMMM D, YYYY")}
        </p>
        <button class="delete" aria-label="close" on:click={CloseModal}
        ></button>
    </header>
    <section class="modal-card-body">
        {#if currentDayMedicines.length === 0}
            <div class="px-2">
                No medicine was taken and no notes were logged on this day.
            </div>
        {:else}
            <div class="px-2">
                {#each currentDayMedicines as m}
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
