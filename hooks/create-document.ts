"use client";

import { createDocument, CreateDocumentPayload } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useCreateDocument() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentPayload) => createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["document"],
      });
      queryClient.invalidateQueries({
        queryKey: ["document-count"],
      });

      router.push("/dashboard");
      toast.success("สร้างเอกสารสำเร็จ");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ??
        error?.message ??
        "สร้างเอกสารไม่สำเร็จ";

      toast.error(errorMessage);
    },
  });
}