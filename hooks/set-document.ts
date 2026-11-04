"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
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
            const message =
                error.response?.data?.message ??
                error.message ??
                "เกิดข้อผิดพลาดในการโหลดเอกสาร";
            console.error("Failed to load documents:", message);
            toast.error(message);
        }
    }, [query.error]);

    return query;
}