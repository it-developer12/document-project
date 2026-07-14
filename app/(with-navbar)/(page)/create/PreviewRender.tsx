// ─── Field preview (canvas + modal) ──────────────────────────────────────────

import { EmployeeDetailPreview } from "./EmployeePreviewRender";
import { FileUploadPreview } from "./FileInputPreviewRender";
import { TableFieldPreview } from "./TablePreviewRender";

export function FieldPreview({ field }: { field: FormField }) {
    const inputStyle: React.CSSProperties = {
        fontSize: "0.8rem",
        color: "var(--muted-foreground)",
        background: "var(--input-background)",
        border: "1px solid var(--border)",
        borderRadius: "0.375rem",
        padding: "0.375rem 0.625rem",
        width: "100%",
        pointerEvents: "none",
    };

    if (field.type === "textarea") {
        return <textarea readOnly rows={2} placeholder={field.placeholder} style={{ ...inputStyle, resize: "none" }} />;
    }
    if (field.type === "select") {
        return (
            <select style={inputStyle} disabled>
                <option>Select an option…</option>
                {field.options?.map((o) => <option key={o}>{o}</option>)}
            </select>
        );
    }
    if (field.type === "radio") {
        return (
            <div className="flex flex-wrap gap-2">
                {field.options?.map((o) => (
                    <label key={o} className="flex items-center gap-2" style={{ fontSize: "0.78rem", color: "var(--foreground)" }}>
                        <input type="radio" disabled style={{ accentColor: "var(--primary)" }} /> {o}
                    </label>
                ))}
            </div>
        );
    }
    if (field.type === "checkbox") {
        return (
            <div className="flex flex-col gap-1">
                {field.options?.map((o) => (
                    <label key={o} className="flex items-center gap-2" style={{ fontSize: "0.78rem", color: "var(--foreground)" }}>
                        <input type="checkbox" disabled style={{ accentColor: "var(--primary)" }} /> {o}
                    </label>
                ))}
            </div>
        );
    }
    if (field.type === "toggle") {
        return (
            <div className="flex items-center gap-2">
                <button
                    className="relative w-10 h-6 rounded-full border transition-colors"
                    style={{ background: field.required ? "var(--primary)" : "var(--switch-background)" }}
                // onClick={() => onChange({ required: !field.required })}
                >
                    <div
                        className="absolute top-1 w-4 h-4 border rounded-full transition-all"
                        style={{ left: field.required ? "calc(100% - 1.25rem)" : "0.25rem", backgroundColor: field.required ? "white" : "black" }}
                    />
                </button>
                <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>Off</span>
            </div>
        );
    }
    if (field.type === "file") {
        return <FileUploadPreview field={field} />;
    }
    if (field.type === "table") {
        return <TableFieldPreview field={field} />;
    }
    if (field.type === "employee_detail") {
        return <EmployeeDetailPreview />;
    }
    return (
        <input
            readOnly
            type={field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
            placeholder={field.placeholder}
            style={inputStyle}
        />
    );
}