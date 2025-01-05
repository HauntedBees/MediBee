import dayjs from "dayjs";
import db, { ExportAllData } from "./Data";
import type { Patient } from "./Models";
import { currentPatient } from "./State";

export interface Settings {
    lastPatient: Patient,
    lastAutoBackup: number,
}

export async function SaveSettings(patient: Patient | undefined) {
    const settings = await GetSettings();
    if (patient) {
        settings.lastPatient = patient;
        StoreSettings(settings);
        localStorage.setItem("medibee-settings", JSON.stringify(settings));
    } else {
        currentPatient.subscribe(p => {
            settings.lastPatient = p;
            StoreSettings(settings);
        });
    }
}

export async function Initialize(): Promise<Patient> {
    const settings = await GetSettings();
    currentPatient.set(settings.lastPatient);
    const now = dayjs();
    if (!settings.lastAutoBackup || now.isAfter(dayjs(settings.lastAutoBackup).add(7, "day"))) {
        ExportAllData(`medibee_autobackup_${now.format()}.json`);
        settings.lastAutoBackup = now.valueOf();
        StoreSettings(settings);
    }
    return settings.lastPatient;
}

async function GetSettings(): Promise<Settings> {
    const savedSettings = localStorage.getItem("medibee-settings");
    if (savedSettings) {
        return JSON.parse(savedSettings);
    } else {
        const newUser: Patient = { name: "New Patient", notes: "" };
        return db.patient.add(newUser).then(id => {
            newUser.id = id;
            currentPatient.set(newUser);
            const newSettings: Settings = { lastPatient: newUser, lastAutoBackup: +new Date() };
            localStorage.setItem("medibee-settings", JSON.stringify(newSettings));
            return newSettings;
        });
    }
}
function StoreSettings(settings: Settings): void {
    localStorage.setItem("medibee-settings", JSON.stringify(settings));
}