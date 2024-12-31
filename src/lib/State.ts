import { writable, type Writable } from "svelte/store";
import type { Medicine, MedicineTaken, Patient } from "./Models";

export const currentPatient: Writable<Patient> = writable({
    name: "",
    notes: ""
});

export const currentTakenMedicine: Writable<Medicine | MedicineTaken | undefined> = writable(undefined);

export const currentPage: Writable<PageData> = writable({
    displayName: "",
    route: "",
    backDisplayName: "",
    backRoute: "",
    data: null
});

export interface PageData {
    displayName: string;
    route: string;
    backDisplayName: string;
    backRoute: string;
    data: any;
}


export function NavTo(
    name: string,
    route: string,
) {
    location.hash = `#${route}`;
    currentPage.set({
        displayName: name,
        route: route,
        backDisplayName: "",
        backRoute: "",
        data: null
    });
}