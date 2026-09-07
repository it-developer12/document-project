import { updateDocument, UpdateDocumentPayload } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useUpdateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateDocumentPayload) => updateDocument(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["document"] });
            toast.success("แก้ไขเอกสารสำเร็จ");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "แก้ไขเอกสารไม่สำเร็จ");
        },
    });
}