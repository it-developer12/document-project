'use client';
import { createDraftTemplate, createTemplate, CreateTemplatePayload } from "@/api/template";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type RegisterErrorResponse = {
    message?: string;
};

export function useCreateTemplate() {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: (data: any) => createTemplate(data),
        onSuccess: () => {
            toast.success('สร้างแบบฟอร์มเอกสารสำเร็จ')
            router.push('/dashboard')
        }
    });
}

export function useCreateDrafTemplate() {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: (data: any) => createDraftTemplate(data),
        onSuccess: () => {
            toast.success('สร้างฉบับร่างแบบฟอร์มเอกสารสำเร็จ')
            router.push('/dashboard')
        }
    });
}