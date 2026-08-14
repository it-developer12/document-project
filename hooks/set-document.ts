"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useDocumentStore } from "@/store/document.store";
import { getDocumentList } from "@/api/document";


type ErrorResponse = {
    message?: string;
};

export function useGetDocuments() {
    const setDocument = useDocumentStore((state) => state.setDocuments);
    const setApproveDoc = useDocumentStore((state) => state.setApproveDocuments);
    const setProcessDoc = useDocumentStore((state) => state.setProcessDocuments);
    const setActivityDoc = useDocumentStore((state) => state.setActivitiesDocuments)

    const query = useQuery({
        queryKey: ["document"],
        queryFn: getDocumentList,
    });

    useEffect(() => {
        if (query.data) {
            setDocument(query.data);
            setApproveDoc(query.data);
            setProcessDoc(query.data);
            setActivityDoc(query.data);
        }
    }, [query.data, setDocument, setApproveDoc, setProcessDoc, setActivityDoc]);

    useEffect(() => {
        if (query.error) {
            const error = query.error as AxiosError<ErrorResponse>;
            console.log(
                "Failed to get documents:",
                error.response?.data?.message ?? error.message,
            );
        }
    }, [query.error]);

    return query;
}