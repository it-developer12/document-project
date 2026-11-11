"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import type { CreateUserPayload, UpdateUserPayload } from "@/api/user";
import type { EmployeeRecord, PositionRecord } from "@/api/utils";
import Loading from "@/app/component/loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useCompanyList,
  usePositionList,
} from "@/hooks/create-form";
import { useGetAllEmployees } from "@/hooks/user-get-all";
import { useCreateUserByAdmin } from "@/hooks/user-create";
import { useUpdateUserInfoByAdmin } from "@/hooks/user-update-info";
import { useAuthStore } from "@/store/auth.store";

const PAGE_SIZE = 10;
const ROLE_OPTIONS = ["USER", "ADMIN", "SUPER_ADMIN"] as const;

function getPositionKey(position: PositionRecord) {
  return JSON.stringify([
    position.name,
    position.division.code,
    position.department.name,
  ]);
}

function isRole(role: string): role is CreateUserPayload["role"] {
  return ROLE_OPTIONS.some((option) => option === role);
}

type EmployeeEditDraft = {
  title: "MR" | "MS" | "MRS" | "";
  firstName: string;
  lastName: string;
  firstNameEn: string;
  lastNameEn: string;
  email: string;
};

const TITLE_OPTIONS: {
  value: EmployeeEditDraft["title"];
  label: string;
}[] = [
    { value: "MR", label: "Mr." },
    { value: "MS", label: "Ms." },
    { value: "MRS", label: "Mrs." },
  ];

type EmployeeOption = {
  value: string;
  label: string;
};

type PositionOption = EmployeeOption & {
  position: PositionRecord;
};

export default function Page() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.user_info.role === "SUPER_ADMIN";
  const { data: employees, isPending, isError, refetch } =
    useGetAllEmployees(isSuperAdmin);
  const companiesQuery = useCompanyList(isSuperAdmin);
  const positionsQuery = usePositionList(isSuperAdmin);
  const updateUserMutation = useUpdateUserInfoByAdmin();
  const createUserMutation = useCreateUserByAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserCode, setNewUserCode] = useState("");
  const [newUserLevel, setNewUserLevel] = useState("");
  const [employeeBeingEdited, setEmployeeBeingEdited] =
    useState<EmployeeRecord | null>(null);
  const [selectedPosition, setSelectedPosition] =
    useState<PositionRecord | null>(null);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [assignedEmployeeCode, setAssignedEmployeeCode] = useState("");
  const [employeeEditDraft, setEmployeeEditDraft] =
    useState<EmployeeEditDraft | null>(null);

  useEffect(() => {
    if (user && !isSuperAdmin) {
      router.replace("/dashboard");
    }
  }, [isSuperAdmin, router, user]);

  const employeeList = employees ?? [];
  const resolvedCompanyCode =
    selectedCompanyCode ||
    (employeeBeingEdited
      ? employeeBeingEdited.company.code ??
      companiesQuery.data?.find(
        (company) => company.name === employeeBeingEdited.company.name,
      )?.code ??
      ""
      : "");
  const EMPLOYEE_OPTIONS: EmployeeOption[] = employeeList
    .map((employee: EmployeeRecord) => ({
      value: employee.employee_code,
      label: employee.fullName || `${employee.firstName} ${employee.lastName}`,
    }))
    .sort((first: any, second: any) =>
      first.label.localeCompare(second.label, undefined, {
        sensitivity: "base",
      }),
    );
  const positionOptions: PositionOption[] = (positionsQuery.data ?? []).map(
    (position) => ({
      value: getPositionKey(position),
      label: position.name,
      position,
    }),
  );
  if (
    selectedPosition &&
    !positionOptions.some(
      (option) => option.value === getPositionKey(selectedPosition),
    )
  ) {
    positionOptions.push({
      value: getPositionKey(selectedPosition),
      label: `${selectedPosition.name} (current)`,
      position: selectedPosition,
    });
  }
  const companyOptions: EmployeeOption[] = (companiesQuery.data ?? []).map(
    (company) => ({ value: company.code, label: company.name }),
  );
  if (
    resolvedCompanyCode &&
    !companyOptions.some((option) => option.value === resolvedCompanyCode) &&
    employeeBeingEdited
  ) {
    companyOptions.push({
      value: resolvedCompanyCode,
      label: `${employeeBeingEdited.company.name} (current)`,
    });
  }
  const roleOptions: EmployeeOption[] = ROLE_OPTIONS.map((role) => ({
    value: role,
    label: role,
  }));
  if (
    selectedRole &&
    !roleOptions.some((option) => option.value === selectedRole)
  ) {
    roleOptions.push({
      value: selectedRole,
      label: `${selectedRole} (current)`,
    });
  }
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredEmployees = employeeList.filter((employee: EmployeeRecord) =>
    [
      employee.employee_code,
      employee.fullName,
      employee.firstName,
      employee.lastName,
      employee.position.name,
      employee.position.division.name,
      employee.position.department.name,
      employee.company.name,
    ]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase().includes(normalizedSearch)),
  );
  const pageCount = Math.max(
    1,
    Math.ceil(filteredEmployees.length / PAGE_SIZE),
  );
  const activePage = Math.min(currentPage, pageCount);
  const paginatedEmployees = filteredEmployees.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE,
  );
  const isCreatingUser = isCreateDialogOpen && employeeBeingEdited === null;

  function openEditDialog(employee: EmployeeRecord) {
    setIsCreateDialogOpen(false);
    setNewUserCode("");
    setNewUserLevel("");
    setEmployeeBeingEdited(employee);
    setSelectedPosition(employee.position);
    setSelectedCompanyCode(
      employee.company.code ??
      companiesQuery.data?.find(
        (company) => company.name === employee.company.name,
      )?.code ??
      "",
    );
    setSelectedRole(employee.role);
    setIsActive(employee.status);
    setAssignedEmployeeCode(employee.assign_to_employee?.employee_code ?? "");
    setEmployeeEditDraft({
      title: employee.title ?? "",
      firstName: employee.firstName,
      lastName: employee.lastName,
      firstNameEn: employee.firstNameEn ?? "",
      lastNameEn: employee.lastNameEn ?? "",
      email: employee.email ?? "",
    });
  }

  function openCreateDialog() {
    setEmployeeBeingEdited(null);
    setSelectedPosition(null);
    setSelectedCompanyCode("");
    setSelectedRole("USER");
    setIsActive(true);
    setAssignedEmployeeCode("");
    setEmployeeEditDraft({
      title: "",
      firstName: "",
      lastName: "",
      firstNameEn: "",
      lastNameEn: "",
      email: "",
    });
    setNewUserCode("");
    setNewUserLevel("");
    setIsCreateDialogOpen(true);
  }

  function closeEditDialog() {
    setIsCreateDialogOpen(false);
    setEmployeeBeingEdited(null);
    setSelectedPosition(null);
    setSelectedCompanyCode("");
    setSelectedRole("");
    setIsActive(true);
    setAssignedEmployeeCode("");
    setEmployeeEditDraft(null);
    setNewUserCode("");
    setNewUserLevel("");
  }

  function saveAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCreatingUser) {
      const level = Number(newUserLevel);
      if (
        !employeeEditDraft ||
        !newUserCode.trim() ||
        !newUserLevel.trim() ||
        !Number.isInteger(level) ||
        !employeeEditDraft.title ||
        !employeeEditDraft.firstName.trim() ||
        !employeeEditDraft.lastName.trim() ||
        !employeeEditDraft.email.trim() ||
        !assignedEmployeeCode ||
        !selectedPosition ||
        !resolvedCompanyCode ||
        !isRole(selectedRole)
      ) {
        return;
      }

      const userData: CreateUserPayload = {
        code: newUserCode.trim(),
        level,
        title: employeeEditDraft.title,
        firstName: employeeEditDraft.firstName.trim(),
        firstNameEn: employeeEditDraft.firstNameEn.trim(),
        lastName: employeeEditDraft.lastName.trim(),
        lastNameEn: employeeEditDraft.lastNameEn.trim(),
        email: employeeEditDraft.email.trim(),
        role: selectedRole,
        assignTo: assignedEmployeeCode,
        position_name: selectedPosition.name,
        companyId: resolvedCompanyCode,
      };

      createUserMutation.mutate(userData, { onSuccess: closeEditDialog });
      return;
    }

    if (
      !employeeBeingEdited ||
      !employeeEditDraft ||
      !assignedEmployeeCode ||
      !selectedPosition ||
      !resolvedCompanyCode ||
      !selectedRole
    ) {
      return;
    }

    const userData: UpdateUserPayload = {
      firstName: employeeEditDraft.firstName,
      lastName: employeeEditDraft.lastName,
      assignTo: assignedEmployeeCode,
      companyId: resolvedCompanyCode,
      role: selectedRole,
      status: isActive,
      position_name: selectedPosition.name
    };
    if (employeeEditDraft.title) userData.title = employeeEditDraft.title;
    if (
      "firstNameEn" in employeeBeingEdited ||
      employeeEditDraft.firstNameEn
    ) {
      userData.firstNameEn = employeeEditDraft.firstNameEn;
    }
    if ("lastNameEn" in employeeBeingEdited || employeeEditDraft.lastNameEn) {
      userData.lastNameEn = employeeEditDraft.lastNameEn;
    }
    if ("email" in employeeBeingEdited || employeeEditDraft.email) {
      userData.email = employeeEditDraft.email;
    }

    updateUserMutation.mutate(
      {
        userId: employeeBeingEdited.employee_code,
        userData,
      },
      { onSuccess: closeEditDialog },
    );
  }

  if (!isSuperAdmin) {
    return <Loading />;
  }

  return (
    <section className="min-h-screen w-full bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Administration</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Employees
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Browse and search employee records.
            </p>
          </div>
        </header>

        <div className="mb-4 w-full">
          <label
            htmlFor="employee-search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Search employees
          </label>
          <div className="flex items-center w-full justify-between gap-2">
            <div className="relative w-1/3">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="employee-search"
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, code, position..."
                className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-sm shadow-none focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
              />
            </div>

            <Button
              type="button"
              onClick={openCreateDialog}
              className="h-10 rounded-lg"
            >
              <Plus aria-hidden="true" className="mr-2 size-4" />
              {"สร้างผู้ใช้ใหม่ (Create User)"}
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isPending ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              Loading employees…
            </p>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center sm:px-6">
              <p className="text-sm text-red-600">
                Could not load employee data.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void refetch()}
                className="h-9 rounded-lg"
              >
                Try again
              </Button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              {employeeList.length === 0
                ? "No employees found."
                : `No employees match “${searchTerm}”.`}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-190 text-left">
                  <thead className="whitespace-nowrap border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 sm:px-6">Employee</th>
                      <th className="px-5 py-3 sm:px-6">Position</th>
                      <th className="px-5 py-3 sm:px-6">Division</th>
                      <th className="px-5 py-3 sm:px-6">Department</th>
                      <th className="px-5 py-3 sm:px-6">Role</th>
                      <th className="px-5 py-3 sm:px-6">Assigned To</th>
                      <th className="px-5 py-3 sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 [&_td]:whitespace-nowrap">
                    {paginatedEmployees.map(
                      (employee: EmployeeRecord, index: number) => (
                        <tr
                          key={`${employee.employee_code}-${index}`}
                          className="text-sm leading-5 text-slate-700"
                        >
                          <td className="px-5 py-4 sm:px-6">
                            <p className="font-medium text-slate-900">
                              {employee.fullName ||
                                `${employee.firstName} ${employee.lastName}`}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {employee.employee_code}
                            </p>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {employee.position.name}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {employee.position.division.name}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {employee.position.department.name}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {employee.role}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            {employee.assign_to_employee ? (
                              <>
                                <p className="font-medium text-slate-900">
                                  {EMPLOYEE_OPTIONS.find(
                                    (option: { value: string | undefined; }) =>
                                      option.value ===
                                      employee.assign_to_employee?.employee_code,
                                  )?.label ??
                                    employee.assign_to_employee.employee_code}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {employee.assign_to_employee.employee_code}
                                </p>
                              </>
                            ) : (
                              <span className="text-slate-400">Not assigned</span>
                            )}
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              aria-label={`Edit ${employee.fullName || employee.employee_code}`}
                              onClick={() => openEditDialog(employee)}
                              className="size-9 rounded-lg border-slate-200"
                            >
                              <Pencil aria-hidden="true" className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="text-sm text-slate-600">
                  Showing {(activePage - 1) * PAGE_SIZE + 1}-
                  {Math.min(activePage * PAGE_SIZE, filteredEmployees.length)}{" "}
                  of {filteredEmployees.length} employees
                </span>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={activePage <= 1}
                    onClick={() => setCurrentPage(activePage - 1)}
                    className="h-9 rounded-lg border-slate-200 bg-white px-3"
                  >
                    Previous
                  </Button>
                  <span
                    aria-live="polite"
                    className="whitespace-nowrap text-sm text-slate-600"
                  >
                    {activePage} / {pageCount}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={activePage >= pageCount}
                    onClick={() => setCurrentPage(activePage + 1)}
                    className="h-9 rounded-lg border-slate-200 bg-white px-3"
                  >
                    Next
                  </Button>
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
      <Dialog
        open={isCreateDialogOpen || employeeBeingEdited !== null}
        onOpenChange={(open) => {
          if (
            !open &&
            !createUserMutation.isPending &&
            !updateUserMutation.isPending
          ) {
            closeEditDialog();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          {(isCreatingUser || employeeBeingEdited) && employeeEditDraft && (
            <form onSubmit={saveAssignment} className="grid gap-5">
              <DialogHeader>
                <DialogTitle>
                  {isCreatingUser ? "Create user" : "Edit employee"}
                </DialogTitle>
                <DialogDescription>
                  {isCreatingUser
                    ? "Enter the user information and assign their position."
                    : "Review the employee information and update the assigned employee."}
                </DialogDescription>
              </DialogHeader>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                {"ผู้บังคับบัญชา (Assigned Employee)"}
                <Select<EmployeeOption, false>
                  options={EMPLOYEE_OPTIONS}
                  value={
                    EMPLOYEE_OPTIONS.find(
                      (option) => option.value === assignedEmployeeCode,
                    ) ?? null
                  }
                  onChange={(option) =>
                    setAssignedEmployeeCode(option?.value ?? "")
                  }
                  formatOptionLabel={(option) =>
                    `${option.label} (${option.value})`
                  }
                  placeholder="Select an employee"
                  className="text-sm"
                  classNamePrefix="employee-select"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  {"คำนำหน้า (Title)"}
                  <Select
                    options={TITLE_OPTIONS}
                    value={
                      TITLE_OPTIONS.find(
                        (option) => option.value === employeeEditDraft.title,
                      ) ?? null
                    }
                    onChange={(option) =>
                      setEmployeeEditDraft((draft) =>
                        draft
                          ? { ...draft, title: option?.value ?? "" }
                          : draft,
                      )
                    }
                    isClearable
                    required={isCreatingUser}
                    placeholder="Select a title"
                    className="text-sm font-normal"
                    classNamePrefix="employee-select"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  {"ชื่อ (First Name)"}
                  <Input
                    value={employeeEditDraft.firstName}
                    onChange={(event) =>
                      setEmployeeEditDraft((draft) =>
                        draft ? { ...draft, firstName: event.target.value } : draft,
                      )
                    }
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  {"นามสกุล (Last Name)"}
                  <Input
                    value={employeeEditDraft.lastName}
                    onChange={(event) =>
                      setEmployeeEditDraft((draft) =>
                        draft ? { ...draft, lastName: event.target.value } : draft,
                      )
                    }
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  {"ชื่อ (First Name) (English)"}
                  <Input
                    value={employeeEditDraft.firstNameEn}
                    onChange={(event) =>
                      setEmployeeEditDraft((draft) =>
                        draft
                          ? { ...draft, firstNameEn: event.target.value }
                          : draft,
                      )
                    }
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  {"นามสกุล (Last Name) (English)"}
                  <Input
                    value={employeeEditDraft.lastNameEn}
                    onChange={(event) =>
                      setEmployeeEditDraft((draft) =>
                        draft
                          ? { ...draft, lastNameEn: event.target.value }
                          : draft,
                      )
                    }
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  {"Email"}
                  <Input
                    type="text"
                    value={employeeEditDraft.email}
                    onChange={(event) =>
                      setEmployeeEditDraft((draft) =>
                        draft ? { ...draft, email: event.target.value } : draft,
                      )
                    }
                    required={isCreatingUser}
                  />
                </label>
              </div>

              {isCreatingUser && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    {"รหัสพนักงาน (Employee Code)"}
                    <Input
                      value={newUserCode}
                      onChange={(event) => setNewUserCode(event.target.value)}
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    {"ระดับ (Level)"}
                    <Input
                      type="number"
                      step="1"
                      value={newUserLevel}
                      onChange={(event) =>
                        setNewUserLevel(event.target.value)
                      }
                      required
                    />
                  </label>
                </div>
              )}

              <dl className="grid gap-4 sm:grid-cols-2">
                {!isCreatingUser && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {"รหัสพนักงาน (Employee Code)"}
                    </dt>
                    <dd className="mt-1 text-sm text-slate-700">
                      {employeeBeingEdited?.employee_code}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {"ตำแหน่ง (Position)"}
                  </dt>
                  <dd className="mt-1">
                    <Select<PositionOption, false>
                      options={positionOptions}
                      value={
                        positionOptions.find(
                          (option) =>
                            option.value ===
                            (selectedPosition
                              ? getPositionKey(selectedPosition)
                              : ""),
                        ) ?? null
                      }
                      onChange={(option) =>
                        setSelectedPosition(option?.position ?? null)
                      }
                      isDisabled={
                        positionsQuery.isPending || positionsQuery.isError
                      }
                      isLoading={positionsQuery.isPending}
                      placeholder="Select position"
                      className="text-sm"
                      classNamePrefix="employee-select"
                    />
                    {positionsQuery.isError && (
                      <span className="mt-1 flex items-center gap-2 text-xs text-red-600">
                        Could not load positions.
                        <button
                          type="button"
                          className="font-medium underline"
                          onClick={() => void positionsQuery.refetch()}
                        >
                          Try again
                        </button>
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {"แผนก (Division)"}
                  </dt>
                  <dd className="mt-1 text-sm text-slate-700">
                    {selectedPosition?.division.name ?? "Not assigned"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {"ฝ่าย (Department)"}
                  </dt>
                  <dd className="mt-1 text-sm text-slate-700">
                    {selectedPosition?.department.name ?? "Not assigned"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {"บริษัท (Company)"}
                  </dt>
                  <dd className="mt-1">
                    <Select<EmployeeOption, false>
                      options={companyOptions}
                      value={
                        companyOptions.find(
                          (option) => option.value === resolvedCompanyCode,
                        ) ?? null
                      }
                      onChange={(option) =>
                        setSelectedCompanyCode(option?.value ?? "")
                      }
                      isDisabled={
                        companiesQuery.isPending || companiesQuery.isError
                      }
                      isLoading={companiesQuery.isPending}
                      menuPlacement="top"
                      placeholder="Select a company"
                      className="text-sm"
                      classNamePrefix="employee-select"
                    />
                    {companiesQuery.isError && (
                      <span className="mt-1 flex items-center gap-2 text-xs text-red-600">
                        Could not load companies.
                        <button
                          type="button"
                          className="font-medium underline"
                          onClick={() => void companiesQuery.refetch()}
                        >
                          Try again
                        </button>
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {"บทบาท (Role)"}
                  </dt>
                  <dd className="mt-1">
                    <Select<EmployeeOption, false>
                      options={roleOptions}
                      value={
                        roleOptions.find(
                          (option) => option.value === selectedRole,
                        ) ?? null
                      }
                      onChange={(option) =>
                        setSelectedRole(option?.value ?? "")
                      }
                      placeholder="Select a role"
                      className="text-sm"
                      // menuPlacement="top"
                      menuShouldScrollIntoView={false}
                      classNamePrefix="employee-select"
                    />
                  </dd>
                </div>
              </dl>

              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="size-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                />
                {"Active"}
              </label>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditDialog}
                  disabled={
                    updateUserMutation.isPending || createUserMutation.isPending
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    (isCreatingUser
                      ? createUserMutation.isPending ||
                      !newUserCode.trim() ||
                      !newUserLevel.trim() ||
                      !Number.isInteger(Number(newUserLevel)) ||
                      !employeeEditDraft.title ||
                      !employeeEditDraft.firstName.trim() ||
                      !employeeEditDraft.lastName.trim() ||
                      !employeeEditDraft.email.trim()
                      : updateUserMutation.isPending) ||
                    positionsQuery.isPending ||
                    positionsQuery.isError ||
                    companiesQuery.isPending ||
                    companiesQuery.isError ||
                    !assignedEmployeeCode ||
                    !selectedPosition ||
                    !resolvedCompanyCode ||
                    !selectedRole ||
                    (isCreatingUser && !isRole(selectedRole))
                  }
                >
                  {isCreatingUser
                    ? createUserMutation.isPending
                      ? "Creating..."
                      : "Create user"
                    : updateUserMutation.isPending
                      ? "Saving..."
                      : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
