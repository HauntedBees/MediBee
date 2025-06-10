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
        OpenModal,
        type PageData,
    } from "../lib/State";

    let patient: Patient = { name: "", notes: "" };
    currentPatient.subscribe((p) => (patient = p));

    let pageInfo: PageData = {} as PageData;
    currentPage.subscribe((sub) => {
        pageInfo = sub;
    });
</script>

<header class="has-background-primary has-text-black">
    <span>{pageInfo.displayName || patient.name}</span>

    <button on:click={() => NavTo("", "")}>
        <Home class={pageInfo.route === "" ? "has-text-white" : ""} />
    </button>
    <button on:click={() => NavTo("Medicine List", "medicine-list")}>
        <PillMultiple
            class={pageInfo.route === "medicine-list" ||
            pageInfo.route === "edit-medicine"
                ? "has-text-white"
                : ""}
        />
    </button>
    <button on:click={() => NavTo("Timeline", "list-view")}>
        <ViewList
            class={pageInfo.route === "list-view" ? "has-text-white" : ""}
        />
    </button>
    <button on:click={() => NavTo("Calendar", "calendar-view")}>
        <Calendar
            class={pageInfo.route === "calendar-view" ? "has-text-white" : ""}
        />
    </button>
    <button on:click={() => OpenModal("accounts")}>
        <AccountMultiple />
    </button>
</header>

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
