<script lang="ts">
  import AppBar from "./components/AppBar.svelte";
  import CalendarView from "./pages/CalendarView.svelte";
  import ListView from "./pages/ListView.svelte";
  import MainPage from "./pages/MainPage.svelte";
  import MedicineList from "./pages/MedicineList.svelte";
  import NewMedicine from "./pages/NewMedicine.svelte";
  import { Initialize } from "./lib/Settings";
  import Settings from "./pages/Settings.svelte";
  import { currentPage } from "./lib/State";
  import TakeMedicine from "./modals/TakeMedicine.svelte";
  let pageName = "";
  let params = {};
  let loading = true;
  currentPage.subscribe((sub) => {
    pageName = sub.route;
    params = sub.data || {};
  });
  Initialize().then(_ => (loading = false));
</script>

<AppBar />

<main class="p-1 m-2">
  {#if loading}
    Loading
  {:else if pageName === ""}
    <MainPage />
  {:else if pageName === "settings"}
    <Settings />
  {:else if pageName === "list-view"}
    <ListView />
  {:else if pageName === "calendar-view"}
    <CalendarView />
  {:else if pageName === "medicine-list"}
    <MedicineList />
  {:else if pageName === "edit-medicine"}
    <NewMedicine {...params} />
  {/if}
</main>
<TakeMedicine />