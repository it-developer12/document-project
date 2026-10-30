"use client";

import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  deleteDepartment,
  deleteDivision,
  deletePosition,
  type DeletePositionPayload,
} from "@/api/utils";

type DeleteDepartmentError = {
  message?: string;
};

type DeleteDivisionError = {
  message?: string;
};

type DeletePositionError = {
  message?: string;
};

type DeletePositionVariables = {
  name: string;
  data: DeletePositionPayload;
};

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => deleteDepartment(name),
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["department"] });
      toast.success(data.message ?? "ลบแผนกเรียบร้อย");
    },
    onError: (error: AxiosError<DeleteDepartmentError>) => {
      toast.error(
        error.response?.data?.message ??
          error.message ??
          "Could not delete department.",
      );
    },
  });
}

export function useDeleteDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => deleteDivision(code),
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["division"] });
      toast.success(data.message ?? "ลบฝ่ายเรียบร้อย");
    },
    onError: (error: AxiosError<DeleteDepartmentError>) => {
      toast.error(
        error.response?.data?.message ??
          error.message ??
          "Could not delete division.",
      );
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, data }: DeletePositionVariables) =>
      deletePosition(name, data),
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["position"] });
      toast.success(data.message ?? "ลบตำแหน่งเรียบร้อย");
    },
    onError: (error: AxiosError<DeletePositionError>) => {
      toast.error(
        error.response?.data?.message ??
          error.message ??
          "Could not delete position.",
      );
    },
  });
}
