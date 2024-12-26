import { writable, type Writable } from "svelte/store";
import type { Medicine, Patient } from "./Models";

export const currentPatient: Writable<Patient> = writable({
    name: "",
    notes: ""
});

export const currentTakenMedicine: Writable<Medicine | undefined> = writable(undefined);

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
    addNew?: PageData;
}


export function NavTo(
    name: string,
    route: string,
    addNewDisplay: string = "",
    addNewRoute: string = "",
) {
    currentPage.set({
        displayName: name,
        route: route,
        backDisplayName: "",
        backRoute: "",
        data: null,
        addNew:
            addNewDisplay == ""
                ? undefined
                : {
                    displayName: addNewDisplay,
                    route: addNewRoute,
                    backDisplayName: name,
                    backRoute: route,
                    data: null,
                },
    });
}