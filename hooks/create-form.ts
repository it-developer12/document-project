"use client";

import { getCompanyList, getDepartmentList, getDivisionList, getEmployeeList, getPositionList } from "@/api/utils";
import { useQuery } from "@tanstack/react-query";

export function useDivisionList(enabled = true) {
	return useQuery({
		queryKey: ["division"],
		queryFn: getDivisionList,
		enabled,
		retry: false,
		staleTime: 30 * 60000,
	});
}

export function useCompanyList(enabled = true) {
    return useQuery({
        queryKey: ["company"],
        queryFn: getCompanyList,
        enabled,
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

export function useDepartmentList() {
    return useQuery({
        queryKey: ["department"],
        queryFn: getDepartmentList,
        retry: false,
        staleTime: 30 * 60000,
    });
}

export function usePositionList(enabled = true) {
    return useQuery({
        queryKey: ["position"],
        queryFn: getPositionList,
        enabled,
        retry: false,
        staleTime: 30 * 60000,
    });
}