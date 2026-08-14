import { addProcessDocument, AddProcessPayload } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function processMutation(
    setDetail: React.Dispatch<React.SetStateAction<{ open: boolean; document_id: string }>>
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AddProcessPayload) => addProcessDocument(data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["document"],
            });
            toast.success("เพิ่มการดำเนินการสำเร็จ");
            setDetail({open: false, document_id: ""})
        },

        onError: (error) => {
            console.error("Error approving document:", error);
            toast.error("เกิดข้อผิดพลาดระหว่างการเพิ่มการดำเนินการ")
        }
    })
}