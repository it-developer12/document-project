"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useDocumentStore } from "@/store/document.store";
import { getDocumentList } from "@/api/document";


type LoginErrorResponse = {
  message?: string;
};

export function useGetDocuments() {
  const queryClient = useQueryClient();
  const setDocument = useDocumentStore((state) => state.setDocuments);

  return useMutation({
    mutationFn: () => getDocumentList(),

    onSuccess: async () => {
      setDocument(await getDocumentList());
      queryClient.setQueryData(["document"], document);
    },

    onError: (error: AxiosError<LoginErrorResponse>) => {
      console.log(
        "Login failed:",
        error.response?.data?.message ?? error.message,
      );
    },
  });
}