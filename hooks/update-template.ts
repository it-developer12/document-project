'use client';
import { getAllForm } from "@/api/form";
import { updateDraftTemplate, updateTemplate } from "@/api/template";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useFormStore } from "@/store/form.store";

export function useUpdateTemplate() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const setForms = useFormStore((state) => state.setForms);
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateTemplate(id, data),
            onSuccess: async (_result, { id }) => {
            const forms = await getAllForm();
            queryClient.setQueryData(["form"], forms);
            setForms(forms);
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ["form-schema", id] }),
                    queryClient.invalidateQueries({ queryKey: ["form-schema-workflow", id] }),
                ]);
            toast.success('อัพเดทแบบฟอร์มเอกสารสำเร็จ');
            router.push('/dashboard')
        }
    });
}

export function useUpdateDraftTemplate() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const setForms = useFormStore((state) => state.setForms);
    return useMutation({
        mutationFn: ({ data }: { data: any }) => updateDraftTemplate(data),
            onSuccess: async (_result, { data }) => {
            const forms = await getAllForm();
            queryClient.setQueryData(["form"], forms);
            setForms(forms);
                const id = data.form?.code;
                if (id) {
                    await Promise.all([
                        queryClient.invalidateQueries({ queryKey: ["form-schema", id] }),
                        queryClient.invalidateQueries({ queryKey: ["form-schema-workflow", id] }),
                    ]);
                }
            toast.success('อัพเดทฉบับร่างแบบฟอร์มเอกสารสำเร็จ');
            router.push('/dashboard')
        }
    });
}