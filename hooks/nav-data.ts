import { getNavNumber } from "@/api/document";
import { useQuery } from "@tanstack/react-query";

export function useNavData() {
    return useQuery({
        queryKey: ["nav"],
        queryFn: getNavNumber,
        retry: false,
        staleTime: 30_000,
    })
}