import { completeDocument } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function finishMutation(
    setDetail: React.Dispatch<React.SetStateAction<{ open: boolean; document_id: string }>>
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: string) => completeDocument(data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["document"],
            });
            toast.success("เอกสารสิ้นสุด");
            setDetail({open: false, document_id: ""})
        },

        onError: (error) => {
            console.error("Error approving document:", error);
            toast.error("เกิดข้อผิดพลาดระหว่างการสิ้นสุดเอกสาร")
        }
    })
}