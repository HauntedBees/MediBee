<script lang="ts">
    import AccountMultiple from "svelte-material-icons/AccountMultiple.svelte";
    import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
    import Calendar from "svelte-material-icons/Calendar.svelte";
    import PillMultiple from "svelte-material-icons/PillMultiple.svelte";
    import PlusCircle from "svelte-material-icons/PlusCircle.svelte";
    import ViewList from "svelte-material-icons/ViewList.svelte";
    import type { Patient } from "../lib/Models";
    import { currentPage, currentPatient, NavTo, type PageData } from "../lib/State";
    import ChangeAccount from "../modals/ChangeAccount.svelte";

    let currentModal = "";

    let patient: Patient = { name: "", notes: "" };
    currentPatient.subscribe(p => patient = p);

    let pageInfo: PageData = {} as PageData;
    currentPage.subscribe(sub => { pageInfo = sub; });
</script>

<header class="has-background-primary has-text-black">
    <span>{pageInfo.displayName || `${patient.name}'s Medical Info`}</span>
    {#if pageInfo.route !== ""}
        <button
            on:click={() => NavTo(pageInfo.backDisplayName, pageInfo.backRoute)}
        >
            <ArrowLeft />
        </button>
        {#if pageInfo.addNew}
            <button
                on:click={() => currentPage.set(pageInfo.addNew!)}
            >
                <PlusCircle />
            </button>
        {/if}
    {:else}
        <button
            on:click={() =>
                NavTo(
                    "Medicine List",
                    "medicine-list",
                    "New Medicine",
                    "edit-medicine",
                )}
        >
            <PillMultiple />
        </button>
        <button
            on:click={() => NavTo("Taken Medicines", "list-view")}
        >
            <ViewList />
        </button>
        <button
            on:click={() => NavTo("Taken Medicines", "calendar-view")}
        >
            <Calendar />
        </button>
        <button on:click={() => (currentModal = "accounts")}>
            <AccountMultiple />
        </button>
    {/if}
</header>

<div class="modal {currentModal == '' ? '' : 'is-active'}">
    <div class="modal-background"></div>
    <div class="modal-card">
        {#if currentModal === "accounts"}
            <ChangeAccount on:close={() => (currentModal = "")} />
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
    }
    span {
        flex-grow: 1;
    }
    button {
        font-size: 1.5rem;
    }
</style>
