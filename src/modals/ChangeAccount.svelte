<script lang="ts">
	import db, { ExportAllData, ImportAllData } from "../lib/Data";
	import type { Patient } from "../lib/Models";
	import { currentPatient } from "../lib/State";
	import { createEventDispatcher } from "svelte";
  	import FileUpload from "svelte-material-icons/FileUpload.svelte";
	import RadioBoxMarked from "svelte-material-icons/RadioboxMarked.svelte";
	import RadioBoxBlank from "svelte-material-icons/RadioboxBlank.svelte";
	import AccountEdit from "svelte-material-icons/AccountEdit.svelte";
	import AccountSwitch from "svelte-material-icons/AccountSwitch.svelte";
	import TextAreaControl from "../components/TextAreaControl.svelte";
	import TextControl from "../components/TextControl.svelte";
	import { SaveSettings } from "../lib/Settings";
    import dayjs from "dayjs";
	const dispatch = createEventDispatcher();

	let currentEditedPatient: Patient | undefined;

	let currentPatientId = 0;
	currentPatient.subscribe(patient => currentPatientId = patient.id || 0);

	let patients: Patient[];
	db.patient.toArray().then(ps => { patients = ps });

	let files: FileList;
	$: {
		if(files) {
			ImportAllData(files[0], true).then(() => {
				location.reload();
			})
		}
	}

	function CloseModal() {
		currentEditedPatient = undefined;
		currentPatientId = 0;
		dispatch("close");
	}
	function Export() {
		ExportAllData(`medibee_${dayjs().format()}.json`);
	}
	function SavePatient() {
		if (!currentEditedPatient) {
			return;
		}
		if (currentEditedPatient.id) {
			db.patient
				.update(currentEditedPatient.id, currentEditedPatient)
				.then(Refresh);
		} else {
			db.patient.add(currentEditedPatient).then(Refresh);
		}
		SaveSettings(currentEditedPatient);
	}
	function Refresh() {
		db.patient.toArray().then((p) => (patients = p));
		currentEditedPatient = undefined;
	}
	function SwitchPatient(p: Patient) {
		SaveSettings(p);
		currentPatient.set(p);
		CloseModal();
	}
</script>

<header class="modal-card-head">
	<p class="modal-card-title">
		{#if currentEditedPatient}
			{currentEditedPatient.name}
		{:else}
			Change Account
		{/if}
	</p>
	<button class="delete" aria-label="close" on:click={CloseModal}></button>
</header>
<section class="modal-card-body">
	{#if currentEditedPatient}
		<TextControl name="Name" bind:value={currentEditedPatient.name} />
		<TextAreaControl name="Notes" bind:value={currentEditedPatient.notes} />
	{:else}
		{#each patients as p}
			<div
				class="block is-flex is-align-items-center is-size-3 {p.id === currentPatientId ? 'has-text-primary' : ''}"
			>
				<div class="icon">
					{#if p.id === currentPatientId}
						<RadioBoxMarked />
					{:else}
						<RadioBoxBlank />
					{/if}
				</div>
				<span class="is-flex-grow-1">{p.name}</span>
				{#if p.id === currentPatientId}
					<button
						class="button is-info"
						on:click={() => (currentEditedPatient = p)}
					>
						<span class="icon">
							<AccountEdit />
						</span>
						<span>Edit</span>
					</button>
				{:else}
					<button
						class="button is-primary"
						on:click={() => SwitchPatient(p)}
					>
						<span class="icon">
							<AccountSwitch />
						</span>
						<span>Switch</span>
					</button>
				{/if}
			</div>
		{/each}
	{/if}
</section>
<footer class="modal-card-foot">
	<div class="buttons">
		{#if currentEditedPatient}
			<button class="button is-primary" on:click={SavePatient}>Save</button>
			<button
				class="button"
				on:click={() => (currentEditedPatient = undefined)}
			>
				Cancel
			</button>
		{:else}
			<button
				class="button is-primary"
				on:click={() =>
					(currentEditedPatient = { name: "New Patient", notes: "" })}
				>
					New Account
				</button>
			<button class="button is-info" on:click={Export}>Export</button>
			<span class="file is-info mt-5">
				<label class="file-label">
					<input
						class="file-input"
						type="file"
						name="import"
						accept="application/json"
						bind:files
					/>
					<span class="file-cta">
						<span class="file-label"> Import</span>
				  	</span>
				</label>
			</span>
			
			<button class="button" on:click={CloseModal}>Cancel</button>
		{/if}
	</div>
</footer>