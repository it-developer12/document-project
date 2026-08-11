"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useDocumentStore } from "@/store/document.store";
import { getDocumentList } from "@/api/document";


type ErrorResponse = {
    message?: string;
};

export function useGetDocuments() {
    const queryClient = useQueryClient();
    const setDocument = useDocumentStore((state) => state.setDocuments);
    const setApproveDoc = useDocumentStore((state) => state.setApproveDocuments);
    const setProcessDoc = useDocumentStore((state) => state.setProcessDocuments);

    return useMutation({
        mutationFn: () => getDocumentList(),

        onSuccess: async () => {
            const document = await getDocumentList();
            setDocument(document);
            setApproveDoc(document);
            setProcessDoc(document);
            queryClient.setQueryData(["document"], document);
        },

        onError: (error: AxiosError<ErrorResponse>) => {
            console.log(
                "Failed to get documents:",
                error.response?.data?.message ?? error.message,
            );
        },
    });
}