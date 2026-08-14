"use client";

import { getAllForm } from "@/api/form";
import { useFormStore } from "@/store/form.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";


type ErrorResponse = {
    message?: string;
};

export function useGetForms() {
    const queryClient = useQueryClient();
    const setForms = useFormStore((state) => state.setForms);

    return useMutation({
        mutationFn: getAllForm,

        onSuccess: (forms) => {
            setForms(forms);
            queryClient.setQueryData(["form"], forms);
        },

        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(
                `Failed to get forms: ${error.response?.data?.message ?? error.message}`
            );
        },
    });
}