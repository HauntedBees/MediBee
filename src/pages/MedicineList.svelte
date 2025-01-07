<script lang="ts">
    import Magnify from "svelte-material-icons/Magnify.svelte";
    import PlusThick from "svelte-material-icons/PlusThick.svelte";
    import db, { AnyStringMatch } from "../lib/Data";
    import icons from "../lib/Icons";
    import type { Medicine } from "../lib/Models";
    import {
        currentPage,
        currentPatient,
        currentTakenMedicine,
        NavTo,
    } from "../lib/State";
    let medicines: Medicine[];
    let searchQuery = "";
    let currentPatientId = 0;
    currentPatient.subscribe((c) => {
        currentPatientId = c.id || 0;
        Search();
    });
    function Search() {
        db.medicine
            .filter((m) => {
                if (m.patientId !== currentPatientId && m.patientId !== 0) {
                    return false;
                }
                if (searchQuery.trim() === "") {
                    return true;
                }
                const safeQuery = searchQuery.trim().toLowerCase();
                return AnyStringMatch([m.name, m.category, m.notes], safeQuery);
            })
            .sortBy("name")
            .then((res) => {
                medicines = res;
            });
    }
    function onMedicineTapped(m: Medicine) {
        NavTo(m.name, "edit-medicine", { medicine: m });
    }
</script>

<div class="columns is-mobile is-gapless is-vcentered">
    <div class="column is-11">
        <div class="field mr-2">
            <p class="control has-icons-left">
                <input
                    class="input"
                    type="text"
                    placeholder="Search"
                    bind:value={searchQuery}
                    on:input={Search}
                />
                <span class="icon is-small is-left">
                    <Magnify />
                </span>
            </p>
        </div>
    </div>
    <div class="column is-1">
        <button
            class="button is-primary is-fullwidth"
            on:click={() => NavTo("New Medicine", "edit-medicine")}
        >
            <span class="icon">
                <PlusThick />
            </span>
        </button>
    </div>
</div>
{#each medicines as m}
    <div class="box columns mb-1 is-gapless is-vcentered is-mobile">
        <div class="column is-2 icon">
            <svelte:component
                this={icons[m.icon]}
                size="2rem"
                color={m.color}
            />
        </div>
        <span class="column is-5">{m.name}</span>
        <div class="column is-5 has-text-right">
            <button
                on:click={() => onMedicineTapped(m)}
                class="button is-small is-primary">Edit</button
            >
            <button
                on:click={() => currentTakenMedicine.set(m)}
                class="button is-small is-success">Take</button
            >
        </div>
    </div>
{/each}
