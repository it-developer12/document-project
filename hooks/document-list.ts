import { getDocumentList } from "@/api/document";
import { useQuery } from "@tanstack/react-query";

export function useDocument() {
    return useQuery({
        queryKey: ["document"],
        queryFn: getDocumentList,
        retry: false,
        staleTime: 30 * 60000, // 30 minutes
    })
}