import { approveDocument, ApproveDocumentPayload } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

export function approveMutation() {
    return useMutation({
        mutationFn: (data: ApproveDocumentPayload) => approveDocument(data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["nav"],
            });
            queryClient.invalidateQueries({
                queryKey: ["document"],
            });
        },

        onError: (error) => {
            console.error("Error approving document:", error);
        }
    })
}