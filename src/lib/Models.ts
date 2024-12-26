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
    if(validUnits.indexOf(medicine.dosageUnit.toLowerCase()) >= 0) {
        return `${medicine.dosageAmount}${medicine.dosageUnit}`;
    } else if(medicine.dosageAmount !== 1 && !medicine.dosageUnit.endsWith("s")) {
        return `${medicine.dosageAmount} ${medicine.dosageUnit}s`;
    } else {
        return `${medicine.dosageAmount} ${medicine.dosageUnit}`;
    }
}