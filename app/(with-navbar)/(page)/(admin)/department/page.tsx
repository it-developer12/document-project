"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import type { DepartmentRecord } from "@/api/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDepartmentList } from "@/hooks/create-form";
import { useCreateDepartment } from "@/hooks/create-utils";
import { useDeleteDepartment } from "@/hooks/delete-utils";
import { useUpdateDepartment } from "@/hooks/update-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DepartmentUpdate = Pick<DepartmentRecord, "code" | "name">;

const PAGE_SIZE = 10;

export default function Page() {
  const { data: departments, isPending, isError, refetch } = useDepartmentList();
  const createDepartmentMutation = useCreateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const [backup, setBackup] = useState<DepartmentUpdate | null>(null);
  const [pendingSubmission, setPendingSubmission] =
    useState<DepartmentUpdate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<DepartmentRecord | null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const departmentList = departments ?? [];
  const filteredDepartments = departmentList.filter((department) =>
    (department.name)
      .toLocaleLowerCase()
      .includes(normalizedSearch),
  );
  const pageCount = Math.max(
    1,
    Math.ceil(filteredDepartments.length / PAGE_SIZE),
  );
  const activePage = Math.min(currentPage, pageCount);
  const paginatedDepartments = filteredDepartments.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE,
  );

  function submitChanges() {
    const originalName = editingCode;
    const name = editingName.trim();
    if (!originalName) return;
    if (!name) {
      toast.error("ต้องใส่ชื่อแผนกในการแก้ไข");
      return;
    }

    const department = departmentList.find(
      (item) => item.name === originalName,
    );
    if (!department) {
      toast.error("ไม่พบแผนกที่ต้องการอัปเดต");
      return;
    }

    setPendingSubmission({ code: department.code, name });
  }

  function startEditing(department: DepartmentRecord) {
    setEditingCode(department.name);
    setEditingName(department.name);
    setBackup({ code: department.code, name: department.name });
  }

  function cancelEditing() {
    setPendingSubmission(null);
    setBackup(null);
    setEditingCode(null);
    setEditingName("");
  }

  function confirmSubmission() {
    if (!pendingSubmission || !editingCode) return;

    updateDepartmentMutation.mutate(
      {
        name: editingCode,
        data: pendingSubmission,
      },
      { onSuccess: cancelEditing },
    );
  }

  function confirmDelete() {
    if (!departmentToDelete) return;

    deleteDepartmentMutation.mutate(departmentToDelete.name, {
      onSuccess: () => setDepartmentToDelete(null),
    });
  }

  function submitNewDepartment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newDepartmentName.trim();
    if (!name) {
      toast.error("Department name is required.");
      return;
    }

    createDepartmentMutation.mutate(
      { name },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewDepartmentName("");
        },
      },
    );
  }

  return (
    <section className="min-h-screen w-full bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-indigo-600">Administration</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {"แผนกทั้งหมด"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {"แก้ไขชื่อแผนก"}
          </p>
        </header>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-md">
            <label
              htmlFor="department-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              {"ค้นหาแผนกจากชื่อ"}
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="department-search"
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search departments..."
                className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-sm shadow-none focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={createDepartmentMutation.isPending}
            className="h-9 rounded-lg bg-indigo-600 px-3 text-white hover:bg-indigo-700"
          >
            <Plus aria-hidden="true" />
            {"เพิ่มแผนก"}
          </Button>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex justify-between items-center border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
            <span>{"Department name"}</span>
          </div>
          {isPending ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              Loading departments…
            </p>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center sm:px-6">
              <p className="text-sm text-red-600">
                Could not load department data.
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
          ) : filteredDepartments.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              No departments match “{searchTerm}”.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {paginatedDepartments.map((department, index) => {
                const isEditing = editingCode === department.name;

                return (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >
                    {isEditing ? (
                      <>
                        <label
                          className="sr-only"
                          htmlFor={`department-${department.name}`}
                        >
                          Department name
                        </label>
                        <Input
                          id={`department-${department.name}`}
                          name={`department-${department.name}`}
                          autoFocus
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              submitChanges();
                            }
                          }}
                          disabled={updateDepartmentMutation.isPending}
                          className="h-10 rounded-lg border-slate-200 bg-white px-3 text-sm shadow-none focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
                        />
                        <div className="flex shrink-0 gap-2">
                          <Button
                            type="button"
                            onClick={() => submitChanges()}
                            disabled={updateDepartmentMutation.isPending}
                            className="h-9 rounded-lg bg-indigo-600 px-3 text-white hover:bg-indigo-700"
                          >
                            <Check aria-hidden="true" />
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={updateDepartmentMutation.isPending}
                            className="h-9 rounded-lg border-slate-200 bg-white px-3"
                          >
                            <X aria-hidden="true" />
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                          {department.name}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          aria-label={`Edit ${department.name}`}
                          title="Edit department name"
                          disabled={editingCode !== null}
                          onClick={() => startEditing(department)}
                          className="size-9 shrink-0 rounded-lg border-slate-200 bg-white p-0"
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          aria-label={`Delete ${department.name}`}
                          title="Delete department"
                          disabled={
                            editingCode !== null ||
                            deleteDepartmentMutation.isPending
                          }
                          onClick={() => setDepartmentToDelete(department)}
                          className="size-9 shrink-0 rounded-lg p-0"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {!isPending && !isError && filteredDepartments.length > 0 && (
            <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span className="text-sm text-slate-600">
                Showing {(activePage - 1) * PAGE_SIZE + 1}-
                {Math.min(activePage * PAGE_SIZE, filteredDepartments.length)}{" "}
                of {filteredDepartments.length} departments
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
          )}
        </div>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            if (!open && !createDepartmentMutation.isPending) {
              setIsAddDialogOpen(false);
              setNewDepartmentName("");
            }
          }}
        >
          <DialogContent>
            <form onSubmit={submitNewDepartment} className="grid gap-6">
              <DialogHeader>
                <DialogTitle>{"เพิ่มแผนกใหม่"}</DialogTitle>
                <DialogDescription>
                  {"กรอกชื่อแผนกที่ต้องการเพิ่มเข้าสู่ระบบ"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <label
                  htmlFor="new-department-name"
                  className="text-sm font-medium text-slate-700"
                >
                  {"ชื่อแผนก"}
                </label>
                <Input
                  id="new-department-name"
                  name="name"
                  autoFocus
                  required
                  value={newDepartmentName}
                  onChange={(event) => setNewDepartmentName(event.target.value)}
                  disabled={createDepartmentMutation.isPending}
                  placeholder="eg. ผลิต 2"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={createDepartmentMutation.isPending}
                  onClick={() => {
                    setIsAddDialogOpen(false);
                  }}
                >
                  {"ยกเลิก"}
                </Button>
                <Button
                  type="submit"
                  disabled={createDepartmentMutation.isPending}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {createDepartmentMutation.isPending
                    ? "Adding..."
                    : "เพิ่ม"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={departmentToDelete !== null}
          onOpenChange={(open) => {
            if (!open && !deleteDepartmentMutation.isPending) {
              setDepartmentToDelete(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{"ยืนยันการลบแผนก"}</DialogTitle>
              <DialogDescription>
                ต้องการลบแผนก “{departmentToDelete?.name}” ใช่หรือไม่?
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDepartmentToDelete(null)}
                disabled={deleteDepartmentMutation.isPending}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteDepartmentMutation.isPending}
              >
                {deleteDepartmentMutation.isPending
                  ? "กำลังลบ..."
                  : "ลบแผนก"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={pendingSubmission !== null}
          onOpenChange={(open) => {
            if (!open) setPendingSubmission(null);
          }}
        >
          <DialogContent className="md:max-w-4xl">
            <DialogHeader>
              <DialogTitle>ยืนยันการเปลี่ยนแปลงแผนก</DialogTitle>
              <DialogDescription>
                ตรวจสอบข้อมูลแผนกเดิมและข้อมูลใหม่ก่อนบันทึกการเปลี่ยนแปลง
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid content-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-slate-800">
                  ข้อมูลเดิมก่อนแก้ไข
                </h2>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">{"ชื่อแผนก:"}</span> {backup?.name}
                </p>
              </div>
              <div className="grid content-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <h2 className="text-sm font-semibold text-indigo-900">
                  ข้อมูลใหม่ที่ต้องการบันทึก
                </h2>
                <p className="text-sm text-indigo-800">
                  <span className="font-medium">{"ชื่อแผนก:"}</span>{" "}
                  {pendingSubmission?.name}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              ยืนยันเพื่อบันทึกการเปลี่ยนแปลงแผนก
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingSubmission(null)}
                disabled={updateDepartmentMutation.isPending}
              >
                แก้ไขต่อ
              </Button>
              <Button
                type="button"
                onClick={confirmSubmission}
                disabled={updateDepartmentMutation.isPending}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {updateDepartmentMutation.isPending
                  ? "กำลังบันทึก..."
                  : "บันทึก"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
