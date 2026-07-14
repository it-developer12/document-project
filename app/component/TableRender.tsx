import { ChevronUp, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import { Controller, Control } from "react-hook-form";

type RowData = Record<string, string>;

const colInputStyle: React.CSSProperties = {
    width: "100%",
    fontSize: "0.78rem",
    color: "var(--foreground)",
    background: "transparent",
    border: "none",
    outline: "none",
    padding: "0",
};

function TableCellInput({ col, value, onChange, mode }: {
    col: TableColumn;
    value: string;
    onChange: (v: string) => void;
    mode: string
}) {
    if (col.type === "date") {
        return (
            <input
                type="date"
                style={colInputStyle}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={mode === "view"}
            />
        );
    }
    if (col.type === "number") {
        return (
            <input
                type="number"
                style={colInputStyle}
                placeholder="0"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={mode === "view"}
            />
        );
    }
    if (col.type === "select" && col.options?.length) {
        return (
            <select
                style={{ ...colInputStyle, appearance: "none" }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={mode === "view"}
            >
                <option value="">—</option>
                {col.options.map((o) => <option key={o}>{o}</option>)}
            </select>
        );
    }
    return (
        <input
            type="text"
            style={colInputStyle}
            placeholder={"-"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={mode === "view"}
        />
    );
}

export function TableFieldPreview({ field, control, mode }: { field: FormField, control: Control<any>, mode: string }) {
    const cols = field.columns ?? [];
    const makeRow = (): RowData =>
        Object.fromEntries(cols.map((c) => [c.id, ""]));

    if (!cols.length) {
        return (
            <div
                className="flex items-center justify-center py-6 rounded-lg border"
                style={{ borderColor: "var(--border)", background: "var(--input-background)" }}
            >
                <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                    No columns defined — add columns in the properties panel
                </p>
            </div>
        );
    }

    return (
        <Controller
            name={field.id}
            control={control}
            defaultValue={[makeRow()]}
            render={({ field: controllerField }) => {
                const rows: RowData[] =
                    controllerField.value ?? [makeRow()];

                const updateCell = (
                    rowIdx: number,
                    colId: string,
                    value: string
                ) => {
                    const updatedRows = rows.map((r, i) =>
                        i === rowIdx
                            ? {
                                ...r,
                                [colId]: value,
                            }
                            : r
                    );

                    controllerField.onChange(updatedRows);
                };

                const addRow = () => {
                    if (
                        field.maxRows &&
                        rows.length >= field.maxRows
                    ) {
                        return;
                    }

                    controllerField.onChange([
                        ...rows,
                        makeRow(),
                    ]);
                };

                const removeRow = (idx: number) => {
                    if (
                        rows.length <=
                        (field.minRows ?? 1)
                    ) {
                        return;
                    }

                    controllerField.onChange(
                        rows.filter((_, i) => i !== idx)
                    );
                };

                const moveRow = (
                    idx: number,
                    dir: -1 | 1
                ) => {
                    const target = idx + dir;

                    if (
                        target < 0 ||
                        target >= rows.length
                    ) {
                        return;
                    }

                    const next = [...rows];

                    [next[idx], next[target]] = [
                        next[target],
                        next[idx],
                    ];

                    controllerField.onChange(next);
                };
                return (
                    <div className="flex flex-col gap-2">
                        <div
                            className="rounded-lg border overflow-hidden"
                            style={{ borderColor: "var(--border)" }}
                        >
                            {/* Header */}
                            <div
                                className="grid"
                                style={{
                                    gridTemplateColumns: `${cols.map((c) => `${c.width ?? 1}fr`).join(" ")} 52px`,
                                    background: "var(--secondary)",
                                    borderBottom: "1px solid var(--border)",
                                }}
                            >
                                {cols.map((col) => (
                                    <div
                                        key={col.id}
                                        className="px-3 py-2 flex items-center gap-1.5"
                                        style={{ borderRight: "1px solid var(--border)" }}
                                    >
                                        <span
                                            style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                                        >
                                            {col.label}
                                        </span>
                                        <span
                                            className="px-1 py-0.5 rounded"
                                            style={{ fontSize: "0.58rem", background: "var(--accent)", color: "var(--primary)", fontWeight: 600 }}
                                        >
                                            {col.type}
                                        </span>
                                    </div>
                                ))}
                                {/* Actions column header */}
                                <div className="px-2 py-2" />
                            </div>

                            {/* Body rows */}
                            {rows.length != 0 && rows.map((row, rowIdx) => (
                                <div
                                    key={rowIdx}
                                    className="grid group"
                                    style={{
                                        gridTemplateColumns: `${cols.map((c) => `${c.width ?? 1}fr`).join(" ")} 52px`,
                                        borderBottom: rowIdx < rows.length - 1 ? "1px solid var(--border)" : undefined,
                                        background: rowIdx % 2 === 0 ? "var(--card)" : "var(--secondary)",
                                    }}
                                >
                                    {cols.map((col) => (
                                        <div
                                            key={col.id}
                                            className="px-3 py-2"
                                            style={{ borderRight: "1px solid var(--border)" }}
                                        >
                                            <TableCellInput
                                                col={col}
                                                value={row[col.id] ?? ""}
                                                onChange={(v) => updateCell(rowIdx, col.id, v)}
                                                mode={mode}
                                            />
                                        </div>
                                    ))}
                                    {/* Row actions */}
                                    <div className="flex items-center justify-center gap-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => moveRow(rowIdx, -1)}
                                            disabled={rowIdx === 0}
                                            className="p-1 rounded transition-colors hover:bg-secondary disabled:opacity-20"
                                            style={{ color: "var(--muted-foreground)" }}
                                            title="Move up"
                                        >
                                            <ChevronUp size={11} />
                                        </button>
                                        <button
                                            onClick={() => removeRow(rowIdx)}
                                            disabled={rows.length <= (field.minRows ?? 1)}
                                            className="p-1 rounded transition-colors hover:bg-destructive/10 disabled:opacity-20"
                                            style={{ color: "var(--muted-foreground)" }}
                                            title="Remove row"
                                        >
                                            <X size={11} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add row */}
                        <button
                            onClick={addRow}
                            disabled={!!(field.maxRows && rows.length >= field.maxRows)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed transition-all hover:bg-secondary disabled:opacity-40 ${mode === "view" ? "hidden" : ""}`}
                            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", fontSize: "0.78rem" }}
                        >
                            <PlusCircle size={13} />
                            Add row
                            {field.maxRows ? (
                                <span className="ml-auto" style={{ fontSize: "0.68rem" }}>
                                    {rows.length} / {field.maxRows}
                                </span>
                            ) : null}
                        </button>
                    </div>
                );
            }}
        />
    );
}