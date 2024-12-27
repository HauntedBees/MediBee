<script lang="ts">
    import dayjs from "dayjs";
	import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
	import ArrowRight from "svelte-material-icons/ArrowRight.svelte";
    import { FormatDosage, type Medicine, type MedicineTaken } from "../lib/Models";
    import db from "../lib/Data";

	interface MedicineAmount {
		medicineId: number;
		medicineName: string;
		dosageAmount: number;
		dosageUnit: string;
		details: MedicineTaken[];
	}
	let medicines: {[key: number]: Medicine} = {};
	db.medicine.toArray().then(ms => {
		ms.forEach(m => medicines[m.id || 0] = m);
	});

	let currentMonth = dayjs().startOf("month");
	let previousMonth = currentMonth.subtract(1, "month");
	let nextMonth = currentMonth.add(1, "month");
	let weekStarts: dayjs.Dayjs[] = [];
	let medicineDictionary: {[key: string]: MedicineAmount[]} = {};	

	function UpdateMonth(change: number) {
		currentMonth = currentMonth.add(change, "month");
		previousMonth = currentMonth.subtract(1, "month");
		nextMonth = currentMonth.add(1, "month");
		weekStarts = [currentMonth.startOf("week")];
		while(true) {
			const next = weekStarts[weekStarts.length - 1].add(1, "week");
			if(next.isSame(currentMonth, "month")) {
				weekStarts.push(next);
			} else {
				break;
			}
		}
		db.taken.where("timeTaken").between(
			currentMonth.toDate(), 
			currentMonth.endOf("month").toDate(), 
			true, 
			false
		).toArray().then(ms => {
			medicineDictionary = {};
			ms.forEach(m => {
				const key = dayjs(m.timeTaken).startOf("day").format();
				if(medicineDictionary[key]) {
					let found = false;
					for(let i = 0; i < medicineDictionary[key].length; i++) {
						const med = medicineDictionary[key][i];
						if(med.medicineName === m.medicineName) {
							found = true;
							med.dosageAmount += m.dosageAmount;
							med.details.push(m);
							break;
						}
					}
					if(!found) {
						medicineDictionary[key].push({
							medicineId: m.medicineId,
							medicineName: m.medicineName,
							dosageAmount: m.dosageAmount,
							dosageUnit: m.dosageUnit,
							details: [m]
						});
					}
				} else {
					medicineDictionary[key] = [{
						medicineId: m.medicineId,
						medicineName: m.medicineName,
						dosageAmount: m.dosageAmount,
						dosageUnit: m.dosageUnit,
						details: [m]
					}];
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
			startOfWeek.add(6, "day")
		];
	}
	UpdateMonth(0);
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
			<th class="has-text-centered" colspan="5">{currentMonth.format("MMMM")}</th>
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
					<td>
						<div class="has-text-right {day.isSame(currentMonth, "month") ? "" : "has-text-light"}">{day.format("D")}</div>
						{#each medicineDictionary[day.format()] as m}
							<div class="medinfo mb-1 p-1 has-text-black" style="background-color: {medicines[m.medicineId]?.color ?? "#FFFFFF"}">
								{m.medicineName} ({FormatDosage(m)})
							</div>
						{/each}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
<style>
	.medinfo {
		border-radius: 4px;
		font-size: 0.75rem;
		word-break: break-all;
	}
</style>