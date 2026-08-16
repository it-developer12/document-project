'use client';
import { createTemplate, CreateTemplatePayload } from "@/api/template";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useCreateTemplate() {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: (data: any) => createTemplate(data),
        onSuccess: () => {
            toast.success('สร้างรูปแบบเอกสารสำเร็จ')
            router.push('/dashboard')
        }
    });
}