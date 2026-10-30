"use client";

import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  updateCompany,
  updateDepartment,
  updateDivision,
  updatePosition,
  updatePositionPayload,
  type updateDepartmentPayload,
} from "@/api/utils";

type UpdateCompanyVariables = {
  companyId: string;
  companyData: FormData;
};

type UpdateCompanyError = {
  message?: string;
};

type UpdateDepartmentError = {
  message?: string;
};

type UpdateDivisionError = {
  message?: string;
};

type UpdatePositionError = {
  message?: string;
};

type UpdateDepartmentVariables = {
  name: string;
  data: updateDepartmentPayload;
};

type UpdateDivisionVariables = {
  code: string;
  data: updateDepartmentPayload;
};

type UpdatePositionVariables = {
  name: string,
  data: updatePositionPayload
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, companyData }: UpdateCompanyVariables) =>
      updateCompany(companyId, companyData),
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["company"] });
      if (data.message) toast.success(data.message);
    },
    onError: (error: AxiosError<UpdateCompanyError>) => {
      toast.error(
        error.response?.data?.message ??
        error.message ??
        "Could not update company.",
      );
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, data }: UpdateDepartmentVariables) =>
      updateDepartment(name, data),
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["department"] });
      if (data.message) toast.success(data.message);
    },
    onError: (error: AxiosError<UpdateDepartmentError>) => {
      toast.error(
        error.response?.data?.message ??
        error.message ??
        "Could not update department.",
      );
    },
  });
}

export function useUpdateDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, data }: UpdateDivisionVariables) =>
      updateDivision(code, data),
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["division"] });
      if (data.message) toast.success(data.message);
    },
    onError: (error: AxiosError<UpdateDivisionError>) => {
      toast.error(
        error.response?.data?.message ??
        error.message ??
        "Could not update division.",
      );
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, data }: UpdatePositionVariables) =>
      updatePosition(name, data),
    onSuccess: async (data: { message?: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["position"] });
      if (data.message) toast.success(data.message);
    },
    onError: (error: AxiosError<UpdatePositionError>) => {
      toast.error(
        error.response?.data?.message ??
        error.message ??
        "Could not update position.",
      );
    },
  });
}