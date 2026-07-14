'use client'
import { useState } from "react";
import { UploadCloud, FileImage, X } from "lucide-react";
import { useForm, SubmitHandler, Control, Controller } from "react-hook-form"

export function FileUploadPreview({ field, control, mode }: { field: FormField, control: Control<any>, mode: string }) {
        const [draggingFile, setDraggingFile] = useState(false);
        // const [droppedFiles, setDroppedFiles] = useState<string[]>([]);

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDraggingFile(true);
        };
        const handleDragLeave = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDraggingFile(false);
        };

        const inputId = `file-input-${field.id}`;
        const acceptStr = field.acceptedTypes
            ?.map((t) => {
                const map: Record<string, string> = {
                    PDF: ".pdf", DOCX: ".docx", DOC: ".doc", XLSX: ".xlsx",
                    PNG: ".png", JPG: ".jpg", JPEG: ".jpeg", GIF: ".gif",
                    ZIP: ".zip", CSV: ".csv", TXT: ".txt",
                };
                return map[t.toUpperCase()] ?? `.${t.toLowerCase()}`;
            })
            .join(",");

        return (
            <Controller
                name={field.id}
                control={control}
                defaultValue={field.multiple ? [] : null}
                render={({ field: controllerField }) => {
                    const files: File[] = field.multiple
                        ? controllerField.value || []
                        : controllerField.value
                            ? [controllerField.value]
                            : [];

                    const handleDrop = (
                        e: React.DragEvent
                    ) => {
                        e.preventDefault();
                        e.stopPropagation();

                        setDraggingFile(false);

                        const droppedFiles = Array.from(
                            e.dataTransfer.files
                        );

                        if (!droppedFiles.length) return;

                        if (field.multiple) {
                            controllerField.onChange([
                                ...files,
                                ...droppedFiles,
                            ]);
                        } else {
                            controllerField.onChange(
                                droppedFiles[0]
                            );
                        }
                    };

                    const handleInputChange = (
                        e: React.ChangeEvent<HTMLInputElement>
                    ) => {
                        const selectedFiles = Array.from(
                            e.target.files ?? []
                        );

                        if (!selectedFiles.length) return;

                        if (field.multiple) {
                            controllerField.onChange([
                                ...files,
                                ...selectedFiles,
                            ]);
                        } else {
                            controllerField.onChange(
                                selectedFiles[0]
                            );
                        }
                    };
                    return (
                        <div className="flex flex-col gap-2">
                            <label htmlFor={inputId}>
                                <div
                                    className="flex flex-col items-center justify-center gap-2 py-5 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-all"
                                    style={{
                                        borderColor: draggingFile ? "var(--primary)" : "var(--border)",
                                        background: draggingFile ? "var(--accent)" : "var(--input-background)",
                                    }}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div
                                        className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
                                        style={{ background: draggingFile ? "var(--primary)" : "var(--secondary)" }}
                                    >
                                        <UploadCloud size={17} color={draggingFile ? "#fff" : "var(--primary)"} />
                                    </div>
                                    <div className="text-center">
                                        <p style={{ fontSize: "1rem", fontWeight: 500, color: "var(--foreground)" }}>
                                            {draggingFile ? "Drop to upload" : "Drag & drop files here"}
                                        </p>
                                        <p style={{ fontSize: "1rem", color: "var(--muted-foreground)", marginTop: "0.15rem" }}>
                                            or{" "}
                                            <span style={{ color: "var(--primary)", fontWeight: 500 }}>click to browse</span>
                                            {field.maxSizeMb ? ` · max ${field.maxSizeMb} MB` : ""}
                                        </p>
                                    </div>
                                    {field.acceptedTypes && field.acceptedTypes.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-1 mt-1">
                                            {field.acceptedTypes.map((t) => (
                                                <span
                                                    key={t}
                                                    className="px-1.5 py-0.5 rounded"
                                                    style={{ fontSize: "1rem", fontWeight: 600, background: "var(--secondary)", color: "var(--muted-foreground)", letterSpacing: "0.04em" }}
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </label>
                            <input
                                id={inputId}
                                type="file"
                                className="hidden"
                                accept={acceptStr}
                                multiple={field.multiple}
                                onChange={handleInputChange}
                                disabled = {mode === "view"}
                            />
                            {files.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                    {files.map((file) => {
                                        const ext =
                                            file.name.split(".").pop()?.toUpperCase() ??
                                            "FILE";
                                        return (
                                            <div
                                                key={`${file.name}-${file.lastModified}`}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border"
                                                style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
                                            >
                                                <div
                                                    className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                                                    style={{ background: "var(--accent)" }}
                                                >
                                                    <FileImage size={13} color="var(--primary)" />
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--foreground)" }} className="truncate">
                                                        {file.name}
                                                    </span>
                                                    <span style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>{ext} file</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (field.multiple) {
                                                            controllerField.onChange(
                                                                files.filter(
                                                                    (f) =>
                                                                        !(
                                                                            f.name === file.name &&
                                                                            f.lastModified ===
                                                                            file.lastModified
                                                                        )
                                                                )
                                                            );
                                                        } else {
                                                            controllerField.onChange(null);
                                                        }
                                                    }}
                                                    className="p-1 rounded-md hover:bg-destructive/10 transition-colors shrink-0"
                                                    style={{ color: "var(--muted-foreground)" }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                }}
            />
        );
    }