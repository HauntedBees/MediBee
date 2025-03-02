import Dexie, { type EntityTable } from "dexie";
import { exportDB, importDB, importInto } from "dexie-export-import";
import type { Medicine, MedicineTaken, MedicineToTake, Patient, PatientMedicineInfo } from "./Models";
import download from "downloadjs";
import dayjs from "dayjs";

const db = new Dexie("MedBee-004") as Dexie & {
    patient: EntityTable<Patient, "id">
    medicine: EntityTable<Medicine, "id">
    taken: EntityTable<MedicineTaken, "id">
};

db.version(1).stores({
    patient: "++id, name, notes",
    medicine: "++id, patientId, name, category, dosageAmount, dosageUnit, notes, icon, color, frequency, dailyAmount, dayOfWeek",
    taken: "++id, patientId, medicineId, medicineName, dosageAmount, dosageUnit, timeTaken, notes"
});

export default db;

export async function ExportAllData(filename: string) {
    const out = await exportDB(db, { prettyJson: true });
    download(out, filename, "text/json");
}
export async function ImportAllData(file: File, replace = true) {
    await importInto(db, file, {
        clearTablesBeforeImport: replace,
        overwriteValues: replace,
        acceptChangedPrimaryKey: replace
    });
}

export function AnyStringMatch(haystacks: string[], needle: string): boolean {
    return haystacks.some(h => IsStringMatch(h, needle));
}

export function IsStringMatch(haystack: string, needle: string): boolean {
    return haystack.toLowerCase().indexOf(needle) >= 0;
}

export function GetPatientMedicineInfo(patientId: number, other = false): Promise<PatientMedicineInfo> {
    const comparisonFunc = other
        ? (m: { patientId: number }) => m.patientId !== patientId
        : (m: { patientId: number }) => m.patientId === patientId;
    return new Promise((resolve, _) => {
        Promise.all([
            db.medicine.filter(m => comparisonFunc(m) || m.patientId === 0).toArray(),
            db.taken
                .where("timeTaken")
                .between(
                    dayjs().startOf("day").toDate(),
                    dayjs().startOf("day").add(1, "day").toDate(),
                    true,
                    false,
                )
                .filter(comparisonFunc)
                .toArray(),
        ]).then((res) => {
            const medicines = res[0];
            const medicinesTaken = res[1];
            const asNeeded = (m: Medicine) => m.frequency === "custom" || m.frequency === "as-needed";
            const allAsNeededMedicines = medicines.filter(asNeeded);
            const categories = [...new Set(allAsNeededMedicines.map(m => m.category))];
            categories.sort();
            categories.push(categories.shift() || "");
            const medicinesToTakeToday: MedicineToTake[] = [];
            medicines.forEach(m => {
                if (asNeeded(m)) {
                    return;
                }
                if (m.frequency === "daily") {
                    const amountTakenToday = medicinesTaken.filter(
                        (t) => t.medicineId === m.id,
                    ).length;
                    if (amountTakenToday < m.dailyAmount) {
                        medicinesToTakeToday.push({
                            medicine: m,
                            amountNeededToday: m.dailyAmount - amountTakenToday,
                        });
                    }
                } else if (
                    m.frequency === "weekly" &&
                    m.dayOfWeek === dayjs().day()
                ) {
                    const amountTakenToday = medicinesTaken.filter(
                        (t) => t.medicineId === m.id,
                    ).length;
                    if (amountTakenToday === 0) {
                        medicinesToTakeToday.push({
                            medicine: m,
                            amountNeededToday: 1,
                        });
                    }
                }
            });
            resolve({
                asNeededMedicines: allAsNeededMedicines,
                categories: categories,
                toTake: medicinesToTakeToday
            });
        });
    });
}