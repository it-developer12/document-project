'use client';
import { getLastestDocument } from "@/api/document";
import { useTrackingStore } from "@/store/tracking.store";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Hook to trigger a search for latest documents and update the zustand store.
export function useSearchTracking() {
    const setSearchDocument = useTrackingStore((state) => state.setSearchDocument);

    const mutation = useMutation({
        mutationFn: async (keyword: string | undefined) => {
            const data = await getLastestDocument();
            if (!keyword) return data;
            const k = keyword.toLowerCase();
            if (Array.isArray(data)) {
                return data.filter((item: any) => {
                    try {
                        return item?.document?.documentNo?.toLowerCase().includes(k);
                    } catch {
                        return false;
                    }
                });
            }
            return [];
        },
        onSuccess: (filteredData: any) => {
            setSearchDocument(filteredData ?? []);
        },
        onError: (error: any) => {
            console.error("Failed to get documents:", error?.response?.data?.message ?? error?.message ?? error);
            toast.error("เกิดข้อผิดพลาดระหว่างการค้นหาการติดตาม");
        }
    });

    return {
        search: (keyword: string) => mutation.mutate(keyword),
        searchAsync: (keyword: string) => mutation.mutateAsync(keyword),
        error: mutation.error,
    };
}