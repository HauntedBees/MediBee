<script lang="ts">
    import {
        CloseModal,
        currentModal,
        NavTo,
        type ModalData,
    } from "../lib/State";
    import ChangeAccount from "../modals/ChangeAccount.svelte";
    import DayInfo from "../modals/DayInfo.svelte";
    import MedicineHistory from "../modals/MedicineHistory.svelte";
    import TakeMedicine from "../modals/TakeMedicine.svelte";
    let contents: ModalData | null = null;
    currentModal.subscribe((m) => {
        if (!m || m.name === "") {
            contents = null;
        } else {
            contents = m;
        }
    });

    window.addEventListener("hashchange", (e) => {
        const newPath = e.newURL.split("#")[1] || "";
        const oldPath = e.oldURL.split("#")[1] || "";
        if (oldPath === "edit-medicine" && newPath === "medicine-list") {
            NavTo("Medicine List", "medicine-list");
        } else if (newPath.indexOf("-modal") >= 0) {
            return;
        } else if (oldPath.indexOf("-modal") >= 0) {
            CloseModal();
        } else if (!newPath) {
            NavTo("", "");
        }
    });
</script>

<div class="modal {contents === null ? '' : 'is-active'}">
    <div
        class="modal-background"
        role="presentation"
        on:click={() => CloseModal()}
    ></div>
    <div class="modal-card">
        <ChangeAccount />
        <TakeMedicine />
        <MedicineHistory />
        <DayInfo />
    </div>
</div>
