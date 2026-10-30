"use client";

import { ExportPDF } from "@/api/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

type ExportPDFVariables = {
  code: string;
  disposition?: "inline" | "attachment";
};

export function useExportPDF() {
  return useMutation({
    mutationFn: async ({
      code,
      disposition = "attachment",
    }: ExportPDFVariables): Promise<{
      code: string;
      disposition: "inline" | "attachment";
      blob: Blob;
    }> => ({
      code,
      disposition,
      blob: await ExportPDF(code, disposition),
    }),
    onSuccess: ({ code, disposition, blob }) => {
      const url = URL.createObjectURL(blob);

      if (disposition === "inline") {
        window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      }

      const link = document.createElement("a");

      link.href = url;
      link.download = `${code}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Could not export PDF.");
    },
  });
}