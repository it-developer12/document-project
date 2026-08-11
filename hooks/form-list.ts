'use client';
import { getAllForm, getFormFields } from "@/api/form";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useForm() {
    return useQuery({
        queryKey: ["form"],
        queryFn: getAllForm,
        retry: false,
        staleTime: 30 * 600000, // 5 hours
    })
}

export function useFormSchema(formId: string) {
    const router = useRouter();
    return useQuery({
        queryKey: ["form-schema", formId],

        queryFn: async () => {
            if (!formId) {
                return Promise.reject(new Error("Form ID is required"));
            }
            const res = await getFormFields(formId);
            return res;
        },

        enabled: !!formId,

        staleTime: 5 * 60 * 1000,
    });
}