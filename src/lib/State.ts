import { writable, type Writable } from "svelte/store";
import type { Patient } from "./Models";

export const currentPatient: Writable<Patient> = writable({
    name: "",
    notes: ""
});

export const currentModal: Writable<ModalData | null> = writable({ name: "" });

export const currentPage: Writable<PageData> = writable({
    displayName: "",
    route: "",
    data: null
});

export interface PageData {
    displayName: string;
    route: string;
    data: any;
}

export interface ModalData {
    name: string;
    data?: any;
}

export function NavTo(
    name: string,
    route: string,
    data: any = null
) {
    location.hash = `#${route}`;
    currentPage.set({
        displayName: name,
        route: route,
        data: data
    });
}

export function OpenModal(name: string, data: any = undefined) {
    currentModal.set({ name, data });
    location.hash += "-modal";
}

export function CloseModal() {
    currentModal.set(null);
    location.hash = location.hash.replace("-modal", "");
}