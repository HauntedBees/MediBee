<script lang="ts">
    import db from "../lib/Data";
    import type { Patient } from "../lib/Models";
    import { currentPatient, NavTo } from "../lib/State";
    import TextAreaControl from "../components/TextAreaControl.svelte";
    import TextControl from "../components/TextControl.svelte";
    let patient: Patient = { name: "", notes: "" };
    currentPatient.subscribe((p) => (patient = p));
    function SavePatient() {
        if (patient.id) {
            db.patient.update(patient.id, patient).then(GoHome);
        } else {
            db.patient.add(patient).then(GoHome);
        }
    }
    function GoHome() {
        NavTo("", "");
    }
</script>

<TextControl name="Name" bind:value={patient.name} />
<TextAreaControl name="Notes" bind:value={patient.notes} />

<footer>
    <button class="btn primary" on:click={SavePatient}>EXPORT DATA</button>
    <button class="btn primary" on:click={SavePatient}>SAVE</button>
</footer>
