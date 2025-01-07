<script lang="ts">
	import dayjs from "dayjs";
	import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
	import ArrowRight from "svelte-material-icons/ArrowRight.svelte";
	import Information from "svelte-material-icons/Information.svelte";
	import {
		FormatDosage,
		MEDICINE_NOTE_ID,
		type Medicine,
		type MedicineTaken,
	} from "../lib/Models";
	import db from "../lib/Data";
	import { currentPatient } from "../lib/State";
	import MedicineRow from "../components/MedicineRow.svelte";

	interface MedicineAmount {
		medicineId: number;
		medicineName: string;
		dosageAmount: number;
		dosageUnit: string;
		details: MedicineTaken[];
	}
	let medicines: { [key: number]: Medicine } = {};
	db.medicine.toArray().then((ms) => {
		ms.forEach((m) => (medicines[m.id || 0] = m));
	});

	let currentMonth = dayjs().startOf("month");
	let previousMonth = currentMonth.subtract(1, "month");
	let nextMonth = currentMonth.add(1, "month");
	let weekStarts: dayjs.Dayjs[] = [];
	let medicineDictionary: { [key: string]: MedicineAmount[] } = {};

	function UpdateMonth(change: number) {
		currentMonth = currentMonth.add(change, "month");
		previousMonth = currentMonth.subtract(1, "month");
		nextMonth = currentMonth.add(1, "month");
		weekStarts = [currentMonth.startOf("week")];
		while (true) {
			const next = weekStarts[weekStarts.length - 1].add(1, "week");
			if (next.isSame(currentMonth, "month")) {
				weekStarts.push(next);
			} else {
				break;
			}
		}
		db.taken
			.where("timeTaken")
			.between(
				currentMonth.toDate(),
				currentMonth.endOf("month").toDate(),
				true,
				false,
			)
			.and((m) => m.patientId === currentPatientId)
			.toArray()
			.then((ms) => {
				medicineDictionary = {};
				ms.forEach((m) => {
					const key = dayjs(m.timeTaken).startOf("day").format();
					if (m.medicineId === MEDICINE_NOTE_ID) {
						const found = (medicineDictionary[key] || []).find(
							(m) => m.medicineId === MEDICINE_NOTE_ID,
						);
						if (found) {
							found.details.push(m);
						} else {
							const newEntry = {
								medicineId: MEDICINE_NOTE_ID,
								medicineName: "Notes",
								dosageAmount: 0,
								dosageUnit: "",
								details: [m],
							};
							if (medicineDictionary[key]) {
								medicineDictionary[key].push(newEntry);
							} else {
								medicineDictionary[key] = [newEntry];
							}
						}
					} else if (medicineDictionary[key]) {
						let found = false;
						for (
							let i = 0;
							i < medicineDictionary[key].length;
							i++
						) {
							const med = medicineDictionary[key][i];
							if (med.medicineName === m.medicineName) {
								found = true;
								med.dosageAmount += m.dosageAmount;
								med.details.push(m);
								break;
							}
						}
						if (!found) {
							medicineDictionary[key].push({
								medicineId: m.medicineId,
								medicineName: m.medicineName,
								dosageAmount: m.dosageAmount,
								dosageUnit: m.dosageUnit,
								details: [m],
							});
						}
					} else {
						medicineDictionary[key] = [
							{
								medicineId: m.medicineId,
								medicineName: m.medicineName,
								dosageAmount: m.dosageAmount,
								dosageUnit: m.dosageUnit,
								details: [m],
							},
						];
					}
				});
			});
	}
	function WeekArray(startOfWeek: dayjs.Dayjs): dayjs.Dayjs[] {
		return [
			startOfWeek,
			startOfWeek.add(1, "day"),
			startOfWeek.add(2, "day"),
			startOfWeek.add(3, "day"),
			startOfWeek.add(4, "day"),
			startOfWeek.add(5, "day"),
			startOfWeek.add(6, "day"),
		];
	}

	let currentDayBeingViewed = "";
	let currentDayMedicines: MedicineTaken[] = [];
	function ViewDay(day: dayjs.Dayjs) {
		currentDayBeingViewed = day.startOf("day").format();
		if (location.hash.indexOf("-modal") < 0) {
			location.hash = `${location.hash}-modal`;
		}
		db.taken
			.where("timeTaken")
			.between(
				day.startOf("day").toDate(),
				day.endOf("day").toDate(),
				true,
				false,
			)
			.and((m) => m.patientId === currentPatientId)
			.toArray()
			.then((ms) => {
				ms.sort(
					(a, b) => a.timeTaken.getTime() - b.timeTaken.getTime(),
				);
				currentDayMedicines = ms;
			});
	}
	function CloseModal() {
		currentDayBeingViewed = "";
		currentDayMedicines = [];
		location.hash = location.hash.replace(/-modal/g, "");
	}
	window.addEventListener("hashchange", (e) => {
		const oldPath = e.oldURL.split("#")[1] || "";
		const newPath = e.newURL.split("#")[1] || "";
		if (oldPath.indexOf("-modal") >= 0 && newPath.indexOf("-modal") < 0) {
			CloseModal();
		}
	});

	let currentPatientId = 0;
	currentPatient.subscribe((p) => {
		currentPatientId = p.id || 0;
		UpdateMonth(0);
	});
</script>

<table class="table is-fullwidth is-narrow">
	<thead class="thead">
		<tr>
			<th class="has-text-centered">
				<button on:click={() => UpdateMonth(-1)}>
					<span class="icon">
						<ArrowLeft />
					</span>
				</button>
			</th>
			<th class="has-text-centered" colspan="5"
				>{currentMonth.format("MMMM YYYY")}</th
			>
			<th class="has-text-centered">
				<button on:click={() => UpdateMonth(1)}>
					<span class="icon">
						<ArrowRight />
					</span>
				</button>
			</th>
		</tr>
		<tr class="has-text-centered">
			<th>SUN</th>
			<th>MON</th>
			<th>TUE</th>
			<th>WED</th>
			<th>THU</th>
			<th>FRI</th>
			<th>SAT</th>
		</tr>
	</thead>
	<tbody class="tbody">
		{#each weekStarts as week}
			<tr>
				{#each WeekArray(week) as day}
					<td on:click={() => ViewDay(day)}>
						<div
							class="has-text-right {day.isSame(
								currentMonth,
								'month',
							)
								? ''
								: 'has-text-light'}"
						>
							{#if medicineDictionary[day.format()]?.find((m) => m.medicineId === MEDICINE_NOTE_ID)}
								<Information />
							{/if}
							{day.format("D")}
						</div>
						{#each medicineDictionary[day.format()] as m}
							{#if m.medicineId !== MEDICINE_NOTE_ID}
								<div
									class="medinfo mb-1 p-1 has-text-black"
									style="background-color: {medicines[
										m.medicineId
									]?.color ?? '#FFFFFF'}"
								>
									<div>{m.medicineName}</div>
									<div>{FormatDosage(m)}</div>
								</div>
							{/if}
						{/each}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
<div class="modal {currentDayBeingViewed ? 'is-active' : ''}">
	<div
		class="modal-background"
		role="presentation"
		on:click={CloseModal}
	></div>
	<div class="modal-card">
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
	</div>
</div>

<style>
	.medinfo {
		border-radius: 4px;
		font-size: 0.65rem;
		word-break: break-all;
	}
</style>
