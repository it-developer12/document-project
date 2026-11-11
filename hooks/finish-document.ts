import { completeDocument } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useFinishMutation(
    setDetail: React.Dispatch<React.SetStateAction<{ open: boolean; document_id: string }>>
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: string) => completeDocument(data),

        onSuccess: async (_result, documentCode) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["document"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["document-detail", documentCode],
                    refetchType: "all",
                }),
            ]);
            toast.success("เอกสารสิ้นสุด");
            setDetail({open: false, document_id: ""})
        },

        onError: (error) => {
            console.error("Error approving document:", error);
            toast.error("เกิดข้อผิดพลาดระหว่างการสิ้นสุดเอกสาร")
        }
    })
}