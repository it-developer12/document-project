'use client';
import { getTrackingDocument } from "@/api/document";
import { useTrackingStore } from "@/store/tracking.store";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Hook to trigger a search for latest documents and update the zustand store.
export function useSearchTrackingDetail() {
    const setSearchDocumentDetail = useTrackingStore((state) => state.setDocumentDetail);

    const mutation = useMutation<any, unknown, string>({
        mutationFn: async (code: string) => {
            const data = await getTrackingDocument(code);
            return data
        },
        onSuccess: (data: any) => {
            if (data) setSearchDocumentDetail(data);
            toast.success('ดึงข้อมูลสำเร็จ')
        },
        onError: (error: any) => {
            console.error("Failed to get documents:", error?.response?.data?.message ?? error?.message ?? error);
            toast.error("เกิดข้อผิดพลาดระหว่างการค้นหาการติดตาม");
        }
    });

    return {
        search: (code: string) => mutation.mutate(code),
        searchAsync: (code: string) => mutation.mutateAsync(code),
        error: mutation.error,
    };
}