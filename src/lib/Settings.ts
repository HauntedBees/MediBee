import db from "./Data";
import type { Patient } from "./Models";
import { currentPatient } from "./State";

export interface Settings {
    lastPatient: Patient
}

export async function SaveSettings(patient: Patient | undefined) {
    if(patient) {
        const settings = {
            lastPatient: patient
        };
        localStorage.setItem("medibee-settings", JSON.stringify(settings));
    } else {
        currentPatient.subscribe(p => {
            const settings = {
                lastPatient: p
            };
            localStorage.setItem("medibee-settings", JSON.stringify(settings));
        });
    }
}

export async function Initialize(): Promise<Patient> {
    const savedSettings = localStorage.getItem("medibee-settings");
    if (savedSettings) {
        const settings: Settings = JSON.parse(savedSettings);
        currentPatient.set(settings.lastPatient);
        return settings.lastPatient;
    } else {
        const newUser: Patient = { name: "New Patient", notes: "" };
        return db.patient.add(newUser).then(id => {
            newUser.id = id;
            currentPatient.set(newUser);
            const newSettings: Settings = { lastPatient: newUser };
            localStorage.setItem("medibee-settings", JSON.stringify(newSettings));
            return newUser;
        });
    }
}