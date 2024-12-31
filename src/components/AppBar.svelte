<script lang="ts">
    import AccountMultiple from "svelte-material-icons/AccountMultiple.svelte";
    import Calendar from "svelte-material-icons/Calendar.svelte";
    import Home from "svelte-material-icons/Home.svelte";
    import PillMultiple from "svelte-material-icons/PillMultiple.svelte";
    import ViewList from "svelte-material-icons/ViewList.svelte";
    import type { Patient } from "../lib/Models";
    import {
        currentPage,
        currentPatient,
        NavTo,
        type PageData,
    } from "../lib/State";
    import ChangeAccount from "../modals/ChangeAccount.svelte";

    let currentModal = "";
    function OpenModal(modal: string) {
        currentModal = modal;
        if (modal) {
            location.hash = `${location.hash}-modal`;
        } else {
            location.hash = location.hash.replace("-modal", "");
            NavTo("", "");
        }
    }
    window.addEventListener("hashchange", (e) => {
        const newPath = e.newURL.split("#")[1];
        const oldPath = e.oldURL.split("#")[1];
        if (newPath.indexOf("-modal") >= 0) {
            return;
        } else if (oldPath.indexOf("-modal") >= 0) {
            currentModal = "";
        } else if (!newPath) {
            NavTo("", "");
        }
    });

    let patient: Patient = { name: "", notes: "" };
    currentPatient.subscribe((p) => (patient = p));

    let pageInfo: PageData = {} as PageData;
    currentPage.subscribe((sub) => {
        pageInfo = sub;
    });
</script>

<header class="has-background-primary has-text-black">
    <span>{pageInfo.displayName || patient.name}</span>

    {#if pageInfo.route !== ""}
        <button
            on:click={() => NavTo(pageInfo.backDisplayName, pageInfo.backRoute)}
        >
            <Home />
        </button>
    {/if}
    {#if pageInfo.route !== "medicine-list" && pageInfo.route !== "edit-medicine"}
        <button on:click={() => NavTo("Medicine List", "medicine-list")}>
            <PillMultiple />
        </button>
    {/if}
    {#if pageInfo.route !== "list-view"}
        <button on:click={() => NavTo("Taken Medicines", "list-view")}>
            <ViewList />
        </button>
    {/if}
    {#if pageInfo.route !== "calendar-view"}
        <button on:click={() => NavTo("Taken Medicines", "calendar-view")}>
            <Calendar />
        </button>
    {/if}
    <button on:click={() => OpenModal("accounts")}>
        <AccountMultiple />
    </button>
</header>

<div class="modal {currentModal == '' ? '' : 'is-active'}">
    <div class="modal-background"></div>
    <div class="modal-card">
        {#if currentModal === "accounts"}
            <ChangeAccount
                on:close={() => {
                    OpenModal("");
                }}
            />
        {/if}
    </div>
</div>

<style>
    header {
        position: sticky;
        top: 0;
        align-items: center;
        display: flex;
        font-size: 1.5rem;
        gap: 16px;
        height: 64px;
        padding: 0 8px;
        position: sticky;
        z-index: 9999;
    }
    span {
        flex-grow: 1;
    }
    button {
        font-size: 1.5rem;
    }
</style>
