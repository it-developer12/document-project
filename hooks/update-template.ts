'use client';
import { updateTemplate } from "@/api/template";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useUpdateTemplate() {
    const router = useRouter();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateTemplate(id, data),
        onSuccess: () => {
            toast.success('สร้างรูปแบบเอกสารสำเร็จ')
            router.push('/dashboard')
        }
    });
}