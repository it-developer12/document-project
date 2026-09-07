import { getCount, getDocumentDetail, getDocumentList } from "@/api/document";
import { useQuery } from "@tanstack/react-query";

export function useDocument() {
    return useQuery({
        queryKey: ["document"],
        queryFn: getDocumentList,
        retry: false,
        staleTime: 30 * 60000, // 30 minutes
    })
}

export function useDocumentCount() {
    return useQuery({
        queryKey: ["document-count"],
        queryFn: async () => {
            const res = await getCount();
            if (!res) {
                return Promise.reject(new Error("Failed to fetch document count"));
            }
            return res;
        },
        retry: false,
        staleTime: 30 * 60000, // 30 minutes
    })
}

export function useDocumentDetail(document_code: string) {
    return useQuery({
        queryKey: ["document-detail", document_code],
        queryFn: async () => {
            if (!document_code) {
                return Promise.reject(new Error("Document code is required"));
            }
            const res = await getDocumentDetail(document_code);
            if (!res) {
                return Promise.reject(new Error("Document not found"));
            }
            return res;
        },
        enabled: !!document_code,
        staleTime: 30 * 60000, // 30 minutes
    })
}