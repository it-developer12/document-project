"use client";

import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createCompany,
  createDepartment,
  createDivision,
  createPosition,
  type CreateDivisionPayload,
  type CreatePositionPayload,
} from "@/api/utils";

type CreateDepartmentError = {
  message?: string;
};

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDepartment,
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["department"] });
      toast.success(data.message ?? "Department created successfully.");
    },
    onError: (error: AxiosError<CreateDepartmentError>) => {
      toast.error(
        error.response?.data?.message ??
          error.message ??
          "Could not create department.",
      );
    },
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompany,
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success(data.message ?? "Company created successfully.");
    },
    onError: (error: AxiosError<CreateDepartmentError>) => {
      toast.error(
        error.response?.data?.message ??
          error.message ??
          "Could not create company.",
      );
    },
  });
}

export function useCreateDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDivisionPayload) => createDivision(data),
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["division"] });
      toast.success(data.message ?? "Division created successfully.");
    },
    onError: (error: AxiosError<CreateDepartmentError>) => {
      toast.error(
        error.response?.data?.message ??
          error.message ??
          "Could not create division.",
      );
    },
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePositionPayload) => createPosition(data),
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["position"] });
      toast.success(data.message ?? "Position created successfully.");
    },
    onError: (error: AxiosError<CreateDepartmentError>) => {
      toast.error(
        error.response?.data?.message ??
          error.message ??
          "Could not create position.",
      );
    },
  });
}
