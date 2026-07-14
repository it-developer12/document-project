import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search
} from "lucide-react";
import { Control, Controller, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import utilsUser from "@/utils/FindUser"
// ─── Employee Detail block ────────────────────────────────────────────────────

const COMPANY_OPTIONS = [
    { label: "บริษัท ซิตี้เฟรชฟรุ๊ต จำกัด (CFF)", value: "cff" },
    { label: "บริษัท ซีทีเอ็กซ์ โฮลดิ้ง จำกัด (CTX)", value: "ctx" },
    { label: "บริษัท โนเบิ้ลมาร์เก็ตติ้ง จำกัด (NBM)", value: "nbm" },
];

export function EmployeeDetailPreview({ field, control, setValue, getValues, mode }: {
    field: FormField, control: Control<any>, setValue: UseFormSetValue<any>;
    getValues: UseFormGetValues<any>, mode: string
}) {
    const inputCls: React.CSSProperties = {
        width: "100%",
        padding: "0.375rem 0.625rem",
        border: "1px solid var(--border)",
        borderRadius: "0.375rem",
        background: "var(--input-background)",
        color: "var(--foreground)",
        fontSize: "0.8rem",
        outline: "none",
    };

    const labelCls: React.CSSProperties = {
        fontSize: "1rem",
        fontWeight: 600,
        color: "var(--foreground)",
        marginBottom: "0.375rem",
        display: "block",
    };

    const required = (
        <span style={{ color: "var(--destructive)", marginLeft: "0.2rem" }}>*</span>
    );

    function searchUser() {
        const employeeCode = getValues(
            "employee_field.employee_code"
        );
        const user = utilsUser.FindUser(employeeCode);

        if (!user) return;

        setValue(
            "employee_field.position",
            user.position
        );

        setValue(
            "employee_field.division",
            user.department_1
        );

        setValue(
            "employee_field.department",
            user.department_2
        );

        setValue(
            "employee_field.first_name",
            user.name
        );

        setValue(
            "employee_field.last_name",
            user.surname
        );

        setValue(
            "employee_field.company",
            user.company
        );
    }

    return (

        <div
            className="flex flex-col gap-4 p-4 rounded-lg border"
            style={{ borderColor: "var(--border)", background: "white" }}
        >
            {/* Row 1: Employee Code | Position | Division | Department */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                {/* รหัสพนักงาน — Employee Code with search button */}
                <div>
                    <label style={labelCls}>รหัสพนักงาน (Employee Code){required}</label>
                    <div className="flex gap-1.5">
                        <Controller
                            name="employee_field.employee_code"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="รหัสพนักงาน"
                                    style={{ ...inputCls, flex: 1 }}
                                    disabled = {mode == "view"}
                                />
                            )}
                        />
                        <button
                            className="flex items-center justify-center px-2.5 rounded-lg shrink-0 transition-opacity hover:opacity-80"
                            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                            tabIndex={-1}
                            type="button"
                            onClick={searchUser}
                        >
                            <Search size={13} />
                        </button>
                    </div>
                </div>

                {/* ตำแหน่ง — Position */}
                <div>
                    <label style={labelCls}>ตำแหน่ง (Position){required}</label>
                    <Controller
                        name="employee_field.position"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                placeholder="ตำแหน่ง"
                                style={inputCls}
                                readOnly
                            />
                        )}
                    />
                </div>

                {/* ฝ่าย — Division */}
                <div>
                    <label style={labelCls}>ฝ่าย (Division){required}</label>
                    <Controller
                        name="employee_field.division"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                placeholder="ฝ่าย"
                                style={inputCls}
                                readOnly
                            />
                        )}
                    />
                </div>

                {/* แผนก — Department */}
                <div>
                    <label style={labelCls}>แผนก (Department){required}</label>
                    <Controller
                        name="employee_field.department"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                placeholder="แผนก"
                                style={inputCls}
                                readOnly
                            />
                        )}
                    />
                </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Row 2: First Name | Last Name | Company */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                {/* ชื่อ — First Name */}
                <div>
                    <label style={labelCls}>ชื่อ (First Name){required}</label>
                    <Controller
                        name="employee_field.first_name"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                placeholder="ชื่อ"
                                style={inputCls}
                                readOnly
                            />
                        )}
                    />
                </div>

                {/* นามสกุล — Last Name */}
                <div>
                    <label style={labelCls}>นามสกุล (Last Name){required}</label>
                    <Controller
                        name="employee_field.last_name"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                placeholder="นามสกุล"
                                style={inputCls}
                                readOnly
                            />
                        )}
                    />
                </div>

                {/* บริษัท — Company (select) */}
                <div>
                    <div className="font-semibold">
                        <span>{"บริษัท "}</span>
                        <span className="text-red-400">{"*"}</span>
                    </div>
                    <Controller
                        name="employee_field.company"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <Select items={COMPANY_OPTIONS} value={field.value} onValueChange={field.onChange} disabled>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="บริษัท...." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem key={""} value={""}>
                                            {"บริษัท...."}
                                        </SelectItem>
                                        {COMPANY_OPTIONS.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>)}
                        />
                </div>
            </div>
            {/* Auto-fill hint */}
            <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginTop: "-0.5rem" }}>
                Fields are auto-filled when an Employee Code is searched.
            </p>
        </div>
    );
}