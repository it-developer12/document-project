'use client'
import { updateDocument, UpdateDocumentPayload } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useUpdateDocument() {
    const queryClient = useQueryClient();
    const router = useRouter()

    return useMutation({
        mutationFn: (data: UpdateDocumentPayload) => updateDocument(data),
        onSuccess: async (_data, variables) => {
            const documentCode = variables instanceof FormData
                ? variables.get("document_code")?.toString()
                : variables.document_code;

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["document"],
                    refetchType: "all",
                }),
                ...(documentCode
                    ? [queryClient.invalidateQueries({
                        queryKey: ["document-detail", documentCode],
                        refetchType: "all" as const,
                    })]
                    : []),
            ]);
            router.push('/dashboard')
            toast.success("แก้ไขเอกสารสำเร็จ");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "แก้ไขเอกสารไม่สำเร็จ");
        },
    });
}