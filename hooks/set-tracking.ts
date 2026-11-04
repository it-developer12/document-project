"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTrackingStore } from "@/store/tracking.store";
import { getLastestDocument } from "@/api/document";
import { toast } from "react-toastify";


type ErrorResponse = {
    message?: string;
};

export function useGetTracking() {
    const setTrackingDoc = useTrackingStore((state) => state.setLastestDocument)

    const query = useQuery({
        queryKey: ["tracking-document"],
        queryFn: getLastestDocument,
    });

    useEffect(() => {
        if (query.data) {
            setTrackingDoc(query.data);
        }
    }, [query.data, setTrackingDoc]);

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