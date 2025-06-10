<script lang="ts">
    import TextControl from "../components/TextControl.svelte";
    import TextAreaControl from "../components/TextAreaControl.svelte";
    import icons from "../lib/Icons";
    import type { Medicine, MedicineTaken, Patient } from "../lib/Models";
    import colors from "../lib/Colors";
    import db from "../lib/Data";
    import { CloseModal, currentPatient, NavTo } from "../lib/State";
    import MedicineRow from "../components/MedicineRow.svelte";
    const iconList = Object.keys(icons);
    export let medicine: Medicine = {
        name: "",
        patientId: 0,
        category: "",
        dosageAmount: 1,
        dosageUnit: "",
        notes: "",
        icon: iconList[0],
        color: colors[0],
        frequency: "as-needed",
        dailyAmount: 1,
        dayOfWeek: 0,
    };
    let patients: Patient[] = [];
    let medicineHistory: MedicineTaken[] | undefined;
    let currentPatientId = 0;
    currentPatient.subscribe((p) => (currentPatientId = p.id || 0));
    db.patient.toArray().then((p) => (patients = p));
    function GoHome() {
        NavTo("Medicine List", "medicine-list");
    }
    function SaveMedicine() {
        if (medicine.id) {
            db.medicine.update(medicine.id, medicine).then(GoHome);
        } else {
            db.medicine.add(medicine).then(GoHome);
        }
    }
</script>

<div class="columns is-mobile">
    <div class="column">
        <div class="fixed-grid has-3-cols">
            <div id="icons" class="grid">
                {#each iconList as key}
                    <button
                        class="button-icon cell"
                        on:click={() => (medicine.icon = key)}
                    >
                        <svelte:component
                            this={icons[key]}
                            size="2rem"
                            color={medicine.icon === key
                                ? medicine.color
                                : "white"}
                        />
                    </button>
                {/each}
            </div>
        </div>
        <div class="fixed-grid has-3-cols">
            <div id="colors" class="grid">
                {#each colors as color}
                    <button
                        class="m-0 orb {medicine.color === color
                            ? 'active'
                            : ''}"
                        on:click={() => (medicine.color = color)}
                        style="background-color: {color}"
                        aria-label={color}
                    ></button>
                {/each}
            </div>
        </div>
    </div>
    <div class="column is-three-fifths">
        <TextControl name="Name" bind:value={medicine.name} />
        <TextControl name="Category" bind:value={medicine.category} />
        <div class="form-control">
            <label class="column" for="dosage">Dosage</label>
            <div class="columns is-mobile mx-1 mb-2">
                <input
                    id="dosage"
                    class="input column is-one-third"
                    bind:value={medicine.dosageAmount}
                    type="number"
                />
                <input
                    class="input column"
                    bind:value={medicine.dosageUnit}
                    type="text"
                    placeholder="Units"
                />
            </div>
        </div>
        <div class="form-control">
            <label for="freq">Frequency</label>
            <div class="block">
                <div class="select mt-1 mb-2 is-fullwidth">
                    <select name="freq" bind:value={medicine.frequency}>
                        <option value="as-needed">As Needed</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
            </div>
            <div class="block mx-2">
                {#if medicine.frequency === "daily"}
                    <div class="columns is-mobile">
                        <input
                            type="text"
                            class="input column is-one-fifth"
                            bind:value={medicine.dailyAmount}
                            placeholder="Every N days"
                        />
                        <span class="column">&nbsp;time(s) per day</span>
                    </div>
                {:else if medicine.frequency === "weekly"}
                    <div class="columns is-mobile">
                        <label class="column is-one-fifth" for="dayOfWeek"
                            >Every</label
                        >
                        <div class="column">
                            <div class="select is-fullwidth">
                                <select
                                    name="dayOfWeek"
                                    bind:value={medicine.dayOfWeek}
                                >
                                    <option value={0}>Sunday</option>
                                    <option value={1}>Monday</option>
                                    <option value={2}>Tuesday</option>
                                    <option value={3}>Wednesday</option>
                                    <option value={4}>Thursday</option>
                                    <option value={5}>Friday</option>
                                    <option value={6}>Saturday</option>
                                </select>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
<div class="form-control mb-4">
    <label for="for">For</label>
    <div class="radios">
        <label class="radio">
            <input type="radio" value={0} bind:group={medicine.patientId} />
            Everyone
        </label>
        <label class="radio">
            <input
                type="radio"
                value={currentPatientId}
                bind:group={medicine.patientId}
            />
            Just Me
        </label>
    </div>
</div>
<div class="pb-6 mb-6">
    <TextAreaControl name="Notes" bind:value={medicine.notes} />
</div>
<footer class="bottom-footer has-text-centered">
    <button class="button is-primary is-large" on:click={SaveMedicine}
        >Save</button
    >
</footer>
<div class="modal {medicineHistory ? 'is-active' : ''}">
    <div
        class="modal-background"
        role="presentation"
        on:click={CloseModal}
    ></div>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">{medicine.name} History</p>
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
    </div>
</div>

<style>
    .orb {
        display: inline-block;
        width: 24px;
        height: 24px;
        border-radius: 12px;
        border: 4px solid #ffffff00;
    }
    .orb.active {
        border: 4px solid #cc00cc;
    }
    .button-icon {
        background-color: #ffffff00;
        border: 0px;
    }
</style>
