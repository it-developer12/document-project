import { create } from "zustand";


export interface FormItem {
    division_code: string;
    division_name: string;
    forms: {
        code: string;
        name: string;
        is_draft: boolean;
    }[]
}

interface FormState {
    forms: FormItem[];
    publish_form: FormItem[];
    setForms: (forms: FormItem[]) => void;
    clearForms: () => void;
    setPublishForm: (forms: FormItem[]) => void;
    clearPublishForms: () => void;
}

export const useFormStore = create<FormState>((set) => ({
    forms: [],
    publish_form: [],

    setForms: (forms) =>
        set({
            forms,
        }),

    clearForms: () =>
        set({
            forms: [],
        }),
    setPublishForm: (forms) =>
        set({
            publish_form: forms,
        }),

    clearPublishForms: () =>
        set({
            publish_form: [],
        }),
}));