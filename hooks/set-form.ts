"use client";

import { getAllForm, getPublishForm } from "@/api/form";
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
                `เกิดข้อผิดพลาด: ${error.response?.data?.message ?? error.message}`
            );
        },
    });
}

export function useGetAllPublishForms() {
    const queryClient = useQueryClient();
    const setPublish = useFormStore((state) => state.setPublishForm);

    return useMutation({
        mutationFn: getPublishForm,

        onSuccess: (forms) => {
            setPublish(forms);
            queryClient.setQueryData(["publish_form"], forms);
        },

        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(
                `เกิดข้อผิดพลาด: ${error.response?.data?.message ?? error.message}`
            );
        },
    });
}