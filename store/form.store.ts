import { create } from "zustand";


export interface FormItem {
    division_code: string;
    division_name: string;
    forms: {
        code: string;
        name: string;
    }[]
}

interface FormState {
    forms: FormItem[];
    setForms: (forms: FormItem[]) => void;
    clearForms: () => void;
}

export const useFormStore = create<FormState>((set) => ({
    forms: [],

    setForms: (forms) =>
        set({
            forms,
        }),

    clearForms: () =>
        set({
            forms: [],
        }),
}));