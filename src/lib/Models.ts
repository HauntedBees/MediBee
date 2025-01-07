export const MEDICINE_NOTE_ID = -69;

export interface Patient {
    id?: number;
    name: string;
    notes: string;
}

export interface Medicine {
    id?: number;
    patientId: number;
    name: string;
    category: string;
    dosageAmount: number;
    dosageUnit: string;
    notes: string;
    icon: string;
    color: string;
    frequency: "as-needed" | "daily" | "weekly" | "custom";
    dailyAmount: number;
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 is Sunday, 6 is Saturday
}

export interface MedicineTaken {
    id?: number;
    patientId: number;
    medicineId: number;
    medicineName: string;
    dosageAmount: number;
    dosageUnit: string;
    timeTaken: Date;
    notes: string;
    approximateTime?: boolean;
}

export interface MedicineToTake {
    medicine: Medicine;
    amountNeededToday: number;
}

export interface PatientMedicineInfo {
    toTake: MedicineToTake[];
    categories: string[];
    asNeededMedicines: Medicine[];
}

const validUnits = ["mg", "ml", "mcg", "oz", "floz", "g", "cc"];

export function FormatDosage(medicine: { dosageUnit: string, dosageAmount: number }): string {
    if (medicine.dosageUnit === "mg" && medicine.dosageAmount >= 1000 && medicine.dosageAmount % 100 === 0) {
        return `${medicine.dosageAmount / 1000}g`;
    } else if (medicine.dosageUnit === "ml" && medicine.dosageAmount >= 1000 && medicine.dosageAmount % 100 === 0) {
        return `${medicine.dosageAmount / 1000}l`;
    } else if (validUnits.indexOf(medicine.dosageUnit.toLowerCase()) >= 0) {
        return `${medicine.dosageAmount}${medicine.dosageUnit}`;
    } else if (medicine.dosageAmount !== 1 && !medicine.dosageUnit.endsWith("s")) {
        return `${medicine.dosageAmount} ${medicine.dosageUnit}s`;
    } else {
        return `${medicine.dosageAmount} ${medicine.dosageUnit}`;
    }
}

function GetNote(name: string, icon: "EmoticonSick" | "NoteEdit" | "NoteText" | "Thermometer"): Medicine {
    return {
        id: MEDICINE_NOTE_ID,
        patientId: 0,
        name: name,
        category: "Notes",
        dosageAmount: 0,
        dosageUnit: "",
        notes: "",
        icon: icon,
        color: "#FA6982",
        frequency: "as-needed",
        dailyAmount: 0,
        dayOfWeek: 0
    };
}

export function GetNotes(): Medicine[] {
    return [
        GetNote("Symptom", "EmoticonSick"),
        GetNote("Test Result", "NoteText"),
        GetNote("Temperature", "Thermometer"),
        GetNote("Misc. Notes", "NoteEdit")
    ];
}