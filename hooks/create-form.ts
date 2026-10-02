"use client";

import { getCompanyList, getDivisionList, getEmployeeList } from "@/api/utils";
import { useQuery } from "@tanstack/react-query";

export function useDivisionList() {
	return useQuery({
		queryKey: ["division"],
		queryFn: getDivisionList,
		retry: false,
		staleTime: 30 * 60000,
	});
}

export function useCompanyList() {
    return useQuery({
        queryKey: ["company"],
        queryFn: getCompanyList,
        retry: false,
        staleTime: 30 * 60000,
    });
}

export function useEmployeeList() {
    return useQuery({
        queryKey: ["employee"],
        queryFn: getEmployeeList,
        retry: false,
        staleTime: 30 * 60000,
    });
}
