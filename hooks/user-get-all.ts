"use client";

import { getAllEmployees } from "@/api/user";
import { useQuery } from "@tanstack/react-query";

export function useGetAllEmployees(enabled = true) {
  return useQuery({
    queryKey: ["all-employees"],
    queryFn: getAllEmployees,
    enabled,
    retry: false,
    staleTime: 30 * 60 * 1000,
  });
}
