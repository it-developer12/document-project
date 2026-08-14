import { createDocument, CreateDocumentPayload } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentPayload) => createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["document"],
      });
    },
  });
}