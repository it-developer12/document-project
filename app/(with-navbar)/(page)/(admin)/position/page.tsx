"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Select from "react-select";
import { toast } from "react-toastify";
import type {
  DepartmentRecord,
  DeletePositionPayload,
  DivisionRecord,
  PositionRecord,
  updatePositionPayload,
} from "@/api/utils";
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
  useDepartmentList,
  useDivisionList,
  usePositionList,
} from "@/hooks/create-form";
import { useCreatePosition } from "@/hooks/create-utils";
import { useDeletePosition } from "@/hooks/delete-utils";
import { useUpdatePosition } from "@/hooks/update-utils";

type PositionDraft = {
  position_name: string;
  division_code: string;
  department_name: string;
};

type SelectOption = {
  label: string;
  value: string;
};

const PAGE_SIZE = 20;

export default function Page() {
  const CreatePositionMutate = useCreatePosition();
  const DeletePositionMutate = useDeletePosition();
  const UpdatePositionMutate = useUpdatePosition();
  const positionsQuery = usePositionList();
  const departmentsQuery = useDepartmentList();
  const divisionsQuery = useDivisionList();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [backup, setBackup] = useState<PositionDraft>({
    position_name: "",
    division_code: "",
    department_name: "",
  });
  const [editingPosition, setEditingPosition] = useState<PositionDraft>({
    position_name: "",
    division_code: "",
    department_name: "",
  });
  const [pendingSubmission, setPendingSubmission] =
    useState<PositionRecord | null>(null);
  const [positionToDelete, setPositionToDelete] =
    useState<PositionRecord | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPosition, setNewPosition] = useState<PositionDraft>({
    position_name: "",
    division_code: "",
    department_name: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const positions = positionsQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];
  const divisions = divisionsQuery.data ?? [];
  const departmentOptions: SelectOption[] = departments.map(
    (department: DepartmentRecord) => ({
      label: department.name,
      value: department.name,
    }),
  );
  const divisionOptions: SelectOption[] = divisions.map(
    (division: DivisionRecord) => ({
      label: division.name,
      value: division.code,
    }),
  );
  const isPending =
    positionsQuery.isPending ||
    departmentsQuery.isPending ||
    divisionsQuery.isPending;
  const hasError =
    positionsQuery.isError ||
    departmentsQuery.isError ||
    divisionsQuery.isError;
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredPositions = positions
    .map((position, index) => ({ position, index }))
    .filter(({ position }) =>
      (position.name)
        .toLocaleLowerCase()
        .includes(normalizedSearch),
    );
  const pageCount = Math.max(1, Math.ceil(filteredPositions.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, pageCount);
  const paginatedPositions = filteredPositions.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE,
  );

  function startEditing(position: PositionRecord, index: number) {
    setEditingIndex(index);
    setEditingPosition({
      department_name: position.department.name,
      division_code: position.division.code,
      position_name: position.name,
    });
    setBackup({
      department_name: position.department.name,
      division_code: position.division.code,
      position_name: position.name,
    });
  }

  function cancelEditing() {
    setPendingSubmission(null);
    setEditingIndex(null);
    setEditingPosition({
      department_name: "",
      division_code: "",
      position_name: "",
    });
  }

  function openModalSubmission() {
    const name = editingPosition.position_name.trim();
    const division = divisions.find(
      (item) => item.code === editingPosition.division_code,
    );
    const department = departments.find(
      (item) => item.name === editingPosition.department_name,
    );

    if (!name || !division || !department) {
      toast.error("Position name, division, and department are required.");
      return;
    }

    setPendingSubmission({
      name,
      division: { code: division.code, name: division.name },
      department: { name: department.name },
    });
  }

  function confirmSubmission() {
    if (!pendingSubmission) return;
    const data: updatePositionPayload = {
      new_position: editingPosition,
      old_position: backup,
    };

    UpdatePositionMutate.mutate(
      { name: backup.position_name, data },
      { onSuccess: cancelEditing },
    );
  }

  function confirmDelete() {
    if (!positionToDelete) return;

    const data: DeletePositionPayload = {
      position_name: positionToDelete.name,
      division_code: positionToDelete.division.code,
      department_name: positionToDelete.department.name,
    };

    DeletePositionMutate.mutate(
      { name: positionToDelete.name, data },
      { onSuccess: () => setPositionToDelete(null) },
    );
  }

  function resetNewPosition() {
    setNewPosition({
      position_name: "",
      division_code: "",
      department_name: "",
    });
  }

  function submitNewPosition(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const positionName = newPosition.position_name.trim();
    if (!positionName || !newPosition.division_code || !newPosition.department_name) {
      toast.error("Position name, division, and department are required.");
      return;
    }

    CreatePositionMutate.mutate(
      {
        position_name: positionName,
        division_code: newPosition.division_code,
        department_name: newPosition.department_name,
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          resetNewPosition();
        },
      },
    );
  }

  async function retryLoading() {
    await Promise.all([
      positionsQuery.refetch(),
      departmentsQuery.refetch(),
      divisionsQuery.refetch(),
    ]);
  }

  return (
    <section className="min-h-screen w-full bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-indigo-600">Administration</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Positions
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Edit position names, divisions, and departments.
          </p>
        </header>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-md">
            <label
              htmlFor="position-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              {"ค้นหาตำแหน่ง"}
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="position-search"
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                  setEditingIndex(null);
                }}
                placeholder={"ค้นหาตำแหน่ง"}
                className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-sm shadow-none focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={CreatePositionMutate.isPending}
            className="h-10 rounded-lg bg-indigo-600 px-3 text-white hover:bg-indigo-700"
          >
            <Plus aria-hidden="true" />
            {"เพิ่มตำแหน่ง"}
          </Button>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid sm:px-6">
            <span>Position name</span>
            <span>Division</span>
            <span>Department</span>
            <span className="sr-only">Actions</span>
          </div>
          {isPending ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              Loading positions…
            </p>
          ) : hasError ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center sm:px-6">
              <p className="text-sm text-red-600">
                Could not load position, division, or department data.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void retryLoading()}
                className="h-9 rounded-lg"
              >
                Try again
              </Button>
            </div>
          ) : positions.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              No positions found.
            </p>
          ) : filteredPositions.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              No positions match “{searchTerm}”.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {paginatedPositions.map(({ position, index }) => {
                const isEditing = editingIndex === index;
                const divisionName =
                  divisions.find(
                    (division) => division.code === position.division.code,
                  )?.name ?? position.division.name;
                const departmentName =
                  departments.find(
                    (department) =>
                      department.name === position.department.name,
                  )?.name ?? position.department.name;

                return (
                  <li
                    key={`${position.name}-${position.division.code}-${index}`}
                    className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-6"
                  >
                    {isEditing ? (
                      <>
                        <div className="grid gap-1.5">
                          <label
                            className="text-xs font-medium text-slate-500 sm:sr-only"
                            htmlFor={`position-name-${index}`}
                          >
                            Position name
                          </label>
                          <Input
                            id={`position-name-${index}`}
                            name={`position-name-${index}`}
                            autoFocus
                            value={editingPosition.position_name}
                            onChange={(event) =>
                              setEditingPosition(prev => ({ ...prev, position_name: event.target.value }))
                            }
                            className="h-10 rounded-lg border-slate-200 bg-white px-3 text-sm shadow-none focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <label
                            className="text-xs font-medium text-slate-500 sm:sr-only"
                            htmlFor={`position-division-${index}`}
                          >
                            Division
                          </label>
                          <Select<SelectOption, false>
                            inputId={`position-division-${index}`}
                            name={`position-division-${index}`}
                            options={divisionOptions}
                            value={
                              divisionOptions.find(
                                (option) =>
                                  option.value === editingPosition.division_code,
                              ) ?? null
                            }
                            onChange={(option) =>
                              setEditingPosition(prev => ({ ...prev, division_code: option?.value ?? "" }))
                            }
                            placeholder="Select division"
                            className="text-sm"
                            classNamePrefix="position-select"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <label
                            className="text-xs font-medium text-slate-500 sm:sr-only"
                            htmlFor={`position-department-${index}`}
                          >
                            Department
                          </label>
                          <Select<SelectOption, false>
                            inputId={`position-department-${index}`}
                            name={`position-department-${index}`}
                            options={departmentOptions}
                            value={
                              departmentOptions.find(
                                (option) =>
                                  option.value === editingPosition.department_name,
                              ) ?? null
                            }
                            onChange={(option) =>
                              setEditingPosition(prev => ({ ...prev, department_name: option?.value ?? "" }))
                            }
                            placeholder="Select department"
                            className="text-sm"
                            classNamePrefix="position-select"
                          />
                        </div>
                        <div className="flex shrink-0 gap-2 sm:justify-end">
                          <Button
                            type="button"
                            onClick={() => openModalSubmission()}
                            className="h-9 rounded-lg bg-indigo-600 px-3 text-white hover:bg-indigo-700"
                          >
                            <Check aria-hidden="true" />
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEditing}
                            className="h-9 rounded-lg border-slate-200 bg-white px-3"
                          >
                            <X aria-hidden="true" />
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="truncate text-sm font-medium text-slate-800">
                          {position.name}
                        </span>
                        <span className="truncate text-sm text-slate-600">
                          {divisionName}
                        </span>
                        <span className="truncate text-sm text-slate-600">
                          {departmentName}
                        </span>
                        <div className="flex shrink-0 items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            aria-label={`Edit ${position.name}`}
                            title="Edit position"
                            disabled={editingIndex !== null}
                            onClick={() => startEditing(position, index)}
                            className="size-9 rounded-lg border-slate-200 bg-white p-0"
                          >
                            <Pencil aria-hidden="true" className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            aria-label={`Delete ${position.name}`}
                            title="Delete position"
                            disabled={
                              editingIndex !== null ||
                              DeletePositionMutate.isPending
                            }
                            onClick={() => setPositionToDelete(position)}
                            className="size-9 rounded-lg p-0"
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {!isPending && !hasError && positions.length > 0 && (
            <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center md:justify-between gap-3 w-full text-sm text-slate-600 sm:justify-start">
                <span>
                  {filteredPositions.length === 0
                    ? "0 positions"
                    : `Showing ${(activePage - 1) * PAGE_SIZE + 1}-${Math.min(
                      activePage * PAGE_SIZE,
                      filteredPositions.length,
                    )} of ${filteredPositions.length}`}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={activePage <= 1}
                    onClick={() => setCurrentPage(activePage - 1)}
                    className="h-9 rounded-lg border-slate-200 bg-white px-3"
                  >
                    Previous
                  </Button>
                  <span aria-live="polite" className="whitespace-nowrap">
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
              </div>
            </footer>
          )}
        </div>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            if (!open && !CreatePositionMutate.isPending) {
              setIsAddDialogOpen(false);
              resetNewPosition();
            }
          }}
        >
          <DialogContent>
            <form onSubmit={submitNewPosition} className="grid gap-6">
              <DialogHeader>
                <DialogTitle>{"เพิ่มตำแหน่งใหม่"}</DialogTitle>
                <DialogDescription>
                  {"กรอกชื่อตำแหน่งและเลือกฝ่ายกับแผนก"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="new-position-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"ชื่อตำแหน่ง"}
                  </label>
                  <Input
                    id="new-position-name"
                    name="position_name"
                    autoFocus
                    required
                    value={newPosition.position_name}
                    onChange={(event) =>
                      setNewPosition((current) => ({
                        ...current,
                        position_name: event.target.value,
                      }))
                    }
                    disabled={CreatePositionMutate.isPending}
                    placeholder="eg. ผู้จัดการ"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="new-position-division"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"ฝ่าย"}
                  </label>
                  <Select<SelectOption, false>
                    inputId="new-position-division"
                    name="division_code"
                    options={divisionOptions}
                    value={
                      divisionOptions.find(
                        (option) => option.value === newPosition.division_code,
                      ) ?? null
                    }
                    onChange={(option) =>
                      setNewPosition((current) => ({
                        ...current,
                        division_code: option?.value ?? "",
                      }))
                    }
                    isDisabled={CreatePositionMutate.isPending}
                    placeholder="Select division"
                    className="text-sm"
                    classNamePrefix="position-select"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="new-position-department"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"แผนก"}
                  </label>
                  <Select<SelectOption, false>
                    inputId="new-position-department"
                    name="department_name"
                    options={departmentOptions}
                    value={
                      departmentOptions.find(
                        (option) => option.value === newPosition.department_name,
                      ) ?? null
                    }
                    onChange={(option) =>
                      setNewPosition((current) => ({
                        ...current,
                        department_name: option?.value ?? "",
                      }))
                    }
                    isDisabled={CreatePositionMutate.isPending}
                    placeholder="Select department"
                    className="text-sm"
                    classNamePrefix="position-select"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={CreatePositionMutate.isPending}
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetNewPosition();
                  }}
                >
                  {"ยกเลิก"}
                </Button>
                <Button
                  type="submit"
                  disabled={CreatePositionMutate.isPending}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {CreatePositionMutate.isPending ? "กำลังเพิ่ม..." : "เพิ่ม"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={pendingSubmission !== null}
          onOpenChange={(open) => {
            if (!open) setPendingSubmission(null);
          }}
        >
          <DialogContent className={`md:max-w-4xl`}>
            <DialogHeader>
              <DialogTitle>{"ยืนยันการเปลี่ยนแปลงข้อมูล"}</DialogTitle>
              <DialogDescription>
                {"ตรวจทานข้อมูลให้เรียบร้อย ก่อนที่จะทำการบันทึกข้อมูล"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid content-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-slate-800">
                  {"ข้อมูลเดิมก่อนบันทึก"}
                </h2>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Position:</span>{" "}
                  {backup.position_name}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Division:</span>{" "}
                  {divisions.find(
                    (division) => division.code === backup.division_code,
                  )?.name ?? backup.division_code}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Department:</span>{" "}
                  {backup.department_name}
                </p>
              </div>
              <div className="grid content-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <h2 className="text-sm font-semibold text-indigo-900">
                  {"ข้อมูลหลังบันทึก"}
                </h2>
                <p className="text-sm text-indigo-800">
                  <span className="font-medium">Position:</span>{" "}
                  {pendingSubmission?.name}
                </p>
                <p className="text-sm text-indigo-800">
                  <span className="font-medium">Division:</span>{" "}
                  {pendingSubmission?.division.name}
                </p>
                <p className="text-sm text-indigo-800">
                  <span className="font-medium">Department:</span>{" "}
                  {pendingSubmission?.department.name}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {"หลังกด บันทึก ข้อมูลจะอัปเดตในระบบ กรุณาตรวจสอบด้วยความละเอียด"}
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingSubmission(null)}
                disabled={UpdatePositionMutate.isPending}
              >
                {"แก้ไขต่อ"}
              </Button>
              <Button
                type="button"
                onClick={confirmSubmission}
                disabled={UpdatePositionMutate.isPending}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {UpdatePositionMutate.isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={positionToDelete !== null}
          onOpenChange={(open) => {
            if (!open && !DeletePositionMutate.isPending) {
              setPositionToDelete(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{"ยืนยันการลบตำแหน่ง"}</DialogTitle>
              <DialogDescription>
                ต้องการลบตำแหน่ง “{positionToDelete?.name}” ใช่หรือไม่?
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </DialogDescription>
            </DialogHeader>
            {positionToDelete && (
              <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                  <span className="font-medium">ตำแหน่ง:</span>{" "}
                  {positionToDelete.name}
                </p>
                <p>
                  <span className="font-medium">ฝ่าย:</span>{" "}
                  {positionToDelete.division.name}
                </p>
                <p>
                  <span className="font-medium">แผนก:</span>{" "}
                  {positionToDelete.department.name}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPositionToDelete(null)}
                disabled={DeletePositionMutate.isPending}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={DeletePositionMutate.isPending}
              >
                {DeletePositionMutate.isPending ? "กำลังลบ..." : "ลบตำแหน่ง"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}