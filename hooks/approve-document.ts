import { approveDocument, ApproveDocumentPayload } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function approveMutation() {
    const router = useRouter();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ApproveDocumentPayload) => approveDocument(data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["document"],
            });
            toast.success("อนุมัติเอกสารสำเร็จ");
            router.push("/dashboard");
        },

        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || "Unknown error";
            toast.error(errorMessage);
        }
    })
}