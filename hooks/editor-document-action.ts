'use client';
import { EditorDocumentActionPayload, editorDocumentAction } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useEditorDocumentAction() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: EditorDocumentActionPayload | FormData) => editorDocumentAction(data),
        onSuccess: async (_result, variables) => {
            const documentCode = variables instanceof FormData
                ? variables.get("document_code")?.toString()
                : variables.document_code;
            const action = variables instanceof FormData
                ? variables.get("action")?.toString()
                : variables.action;

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["document"], refetchType: "all" }),
                ...(documentCode
                    ? [queryClient.invalidateQueries({
                        queryKey: ["document-detail", documentCode],
                        refetchType: "all" as const,
                    })]
                    : []),
            ]);
            if (action === "SAVE") {
                toast.success("บันทึกข้อมูลสำเร็จ");
                router.push("/dashboard");
                return;
            }

            toast.success(action === "SUBMIT"
                ? "บันทึกข้อมูลและส่งต่อสำเร็จ"
                : "ส่งเอกสารกลับเพื่อแก้ไขสำเร็จ");
            router.push("/dashboard");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "ไม่สามารถดำเนินการกับเอกสารได้");
        },
    });
}
