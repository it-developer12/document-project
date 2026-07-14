'use client'
import { useForm, SubmitHandler, Control, Controller, UseFormGetValues, UseFormSetValue } from "react-hook-form"
import { FileUploadPreview } from "./FileInputRender";
import { TableFieldPreview } from "./TableRender";
import { EmployeeDetailPreview } from "./EmployeeDetailRender";

export function FieldPreview({ field, control, setValue, getValues, mode }: {
    field: FormField, control: Control<any>, setValue: UseFormSetValue<any>,
    getValues: UseFormGetValues<any>, mode: string
}) {
    const inputStyle: React.CSSProperties = {
        fontSize: "1rem",
        color: "var(--muted-foreground)",
        background: "var(--input-background)",
        border: "1px solid var(--border)",
        borderRadius: "0.375rem",
        padding: "0.375rem 0.625rem",
        width: "100%",
    };

    if (field.type === "textarea") {
        return (
            <Controller
                name={field.id}
                control={control}
                defaultValue=""
                render={({ field: controllerField }) => (
                    <textarea
                        {...controllerField}
                        rows={5}
                        placeholder={field.placeholder}
                        style={{
                            ...inputStyle,
                            resize: "none",
                        }}
                        disabled = {mode === "view"}
                    />
                )}
            />
        );
    }
    if (field.type === "select") {
        return (
            <Controller
                name={field.id}
                control={control}
                defaultValue=""
                render={({ field: controllerField }) => (
                    <select
                        {...controllerField}
                        style={inputStyle}
                        disabled = {mode === "view"}
                    >
                        <option value="">
                            Select an option...
                        </option>

                        {field.options?.map((o) => (
                            <option
                                key={o}
                                value={o}
                            >
                                {o}
                            </option>
                        ))}
                    </select>
                )}
            />
        );
    }
    if (field.type === "radio") {
        return (
            <Controller
                name={field.id}
                control={control}
                defaultValue=""
                render={({ field: controllerField }) => (
                    <div className="flex flex-wrap">
                        {field.options?.map((o) => (
                            <label
                                key={o}
                                className="flex gap-2 w-1/5"
                            >
                                <input
                                    type="radio"
                                    disabled = {mode === "view"}
                                    value={o}
                                    checked={
                                        controllerField.value === o
                                    }
                                    onChange={() =>
                                        controllerField.onChange(o)
                                    }
                                />
                                {o}
                            </label>
                        ))}
                    </div>
                )}
            />
        );
    }
    if (field.type === "checkbox") {
        return (
            <Controller
                name={field.id}
                control={control}
                defaultValue={[]}
                render={({ field: controllerField }) => (
                    <div className="flex flex-wrap">
                        {field.options?.map((o) => (
                            <label key={o} className="flex items-center gap-2 w-1/4">
                                <input
                                    type="checkbox"
                                    disabled = {mode === "view"}
                                    style={{ accentColor: "var(--primary)" }}
                                    checked={
                                        controllerField.value?.includes(o)
                                    }
                                    onChange={(e) => {
                                        const current =
                                            controllerField.value || [];

                                        if (e.target.checked) {
                                            controllerField.onChange([
                                                ...current,
                                                o,
                                            ]);
                                        } else {
                                            controllerField.onChange(
                                                current.filter(
                                                    (x: string) => x !== o
                                                )
                                            );
                                        }
                                    }}
                                />
                                {o}
                            </label>
                        ))}
                    </div>
                )}
            />
        )
    }
    if (field.type === "toggle") {
        return (
            <Controller
                name={field.id}
                control={control}
                defaultValue={false}
                render={({ field: controllerField }) => (
                    <div className="flex items-center gap-2">
                        <button
                            className="relative w-10 h-6 rounded-full border transition-colors"
                            style={{ background: controllerField.value ? "var(--primary)" : "var(--switch-background)" }}
                            onClick={() => controllerField.onChange(!controllerField.value)}
                            disabled = {mode === "view"}
                        >
                            <div
                                className="absolute top-1 w-4 h-4 border rounded-full transition-all"
                                style={{ left: controllerField.value ? "calc(100% - 1.25rem)" : "0.25rem", backgroundColor: controllerField.value ? "white" : "black" }}
                            />
                        </button>
                        <span style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>{controllerField.value ? "On" : "Off"}</span>
                    </div>
                )}
            />

        );
    }
    if (field.type === "file") {
        return <FileUploadPreview field={field} control={control} mode={mode}/>;
    }
    if (field.type === "table") {
        return <TableFieldPreview field={field} control={control} mode={mode}/>
        // onChange={onChange}
    }
    if (field.type === "employee_detail") {
        return <EmployeeDetailPreview field={field} control={control} setValue={setValue} getValues={getValues} mode={mode}/>
    }
    return (
        <Controller
            name={field.id}
            control={control}
            defaultValue=""
            render={({ field: controllerField }) => (
                <input
                    {...controllerField}
                    disabled = {mode === "view"}
                    type={field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
                    placeholder={field.placeholder}
                    style={inputStyle}
                />
            )}
        />
    );
}