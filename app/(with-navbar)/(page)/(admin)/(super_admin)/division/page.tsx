"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import type { DivisionRecord } from "@/api/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDivisionList } from "@/hooks/create-form";
import { useCreateDivision } from "@/hooks/create-utils";
import { useDeleteDivision } from "@/hooks/delete-utils";
import { useUpdateDivision } from "@/hooks/update-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DivisionUpdate = Pick<DivisionRecord, "code" | "name">;

export default function Page() {
  const { data: divisions, isPending, isError, refetch } = useDivisionList();
  const createDivisionMutation = useCreateDivision();
  const deleteDivisionMutation = useDeleteDivision();
  const updateDivisionMutation = useUpdateDivision();
  const [backup, setBackup] = useState<DivisionUpdate | null>(null);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingSubmission, setPendingSubmission] =
    useState<DivisionUpdate | null>(null);
  const [divisionToDelete, setDivisionToDelete] =
    useState<DivisionRecord | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDivisionCode, setNewDivisionCode] = useState("");
  const [newDivisionName, setNewDivisionName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const divisionList = divisions ?? [];
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredDivisions = divisionList.filter((division) =>
    (division.name)
      .toLocaleLowerCase()
      .includes(normalizedSearch),
  );

  function confirmEdit() {
    const code = editingCode;
    const name = editingName.trim();
    if (!code) return;
    if (!name) {
      toast.error("ต้องใส่ชื่อแผนกในการแก้ไข");
      return;
    }

    const division = divisionList.find((item) => item.code === code);
    if (!division) {
      toast.error("ไม่พบฝ่ายที่ต้องการอัปเดต");
      return;
    }

    setPendingSubmission({ code, name });
  }

  function startEditing(division: DivisionRecord) {
    setEditingCode(division.code);
    setEditingName(division.name);
    setBackup({ code: division.code, name: division.name });
  }

  function cancelEditing() {
    setPendingSubmission(null);
    setBackup(null);
    setEditingCode(null);
    setEditingName("");
  }

  function confirmSubmission() {
    if (!pendingSubmission) return;

    updateDivisionMutation.mutate(
      {
        code: pendingSubmission.code,
        data: pendingSubmission,
      },
      { onSuccess: cancelEditing },
    );
  }

  function confirmDelete() {
    if (!divisionToDelete) return;

    deleteDivisionMutation.mutate(divisionToDelete.code, {
      onSuccess: () => setDivisionToDelete(null),
    });
  }

  function submitNewDivision(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = newDivisionCode.trim();
    const name = newDivisionName.trim();
    if (!code || !name) {
      toast.error("ยังไม่ได้กรอกข้อมูล รหัส หรือ ชื่อ ฝ่าย");
      return;
    } else if(code.length > 3 || code.length < 2) {
      toast.error("รหัสต้องมีอย่างน้อย 2 ตัวและไม่เกิน 3 คัว")
    }

    createDivisionMutation.mutate(
      { code, name },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewDivisionCode("");
          setNewDivisionName("");
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
            {"ฝ่ายทั้งหมด"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {"แก้ไขชื่อฝ่าย"}
          </p>
        </header>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-md">
            <label
              htmlFor="division-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              {"ค้นหาฝ่ายจากชื่อ"}
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="division-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search divisions..."
                className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-sm shadow-none focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={createDivisionMutation.isPending}
            className="h-9 rounded-lg bg-indigo-600 px-3 text-white hover:bg-indigo-700"
          >
            <Plus aria-hidden="true" />
            {"เพิ่มฝ่าย"}
          </Button>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
            <span>Division name</span>
          </div>

          {isPending ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              Loading divisions…
            </p>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center sm:px-6">
              <p className="text-sm text-red-600">
                Could not load division data.
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
          ) : divisionList.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              No divisions found.
            </p>
          ) : filteredDivisions.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              No divisions match “{searchTerm}”.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredDivisions.map((division) => {
                const isEditing = editingCode === division.code;

                return (
                  <li
                    key={division.code}
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >
                    {isEditing ? (
                      <>
                        <label
                          className="sr-only"
                          htmlFor={`division-${division.code}`}
                        >
                          Division name
                        </label>
                        <Input
                          id={`division-${division.code}`}
                          name={`division-${division.code}`}
                          autoFocus
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              confirmEdit();
                            }
                          }}
                          disabled={updateDivisionMutation.isPending}
                          className="h-10 rounded-lg border-slate-200 bg-white px-3 text-sm shadow-none focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
                        />
                        <div className="flex shrink-0 gap-2">
                          <Button
                            type="button"
                            onClick={() => confirmEdit()}
                            disabled={updateDivisionMutation.isPending}
                            className="h-9 rounded-lg bg-indigo-600 px-3 text-white hover:bg-indigo-700"
                          >
                            <Check aria-hidden="true" />
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={updateDivisionMutation.isPending}
                            className="h-9 rounded-lg border-slate-200 bg-white px-3"
                          >
                            <X aria-hidden="true" />
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            {division.code}
                          </span>
                          <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                            {division.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          aria-label={`Edit ${division.name}`}
                          title="Edit division name"
                          disabled={editingCode !== null}
                          onClick={() => startEditing(division)}
                          className="size-9 shrink-0 rounded-lg border-slate-200 bg-white p-0"
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          aria-label={`Delete ${division.name}`}
                          title="Delete division"
                          disabled={
                            editingCode !== null ||
                            deleteDivisionMutation.isPending
                          }
                          onClick={() => setDivisionToDelete(division)}
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

          {!isPending && !isError && divisionList.length > 0 && (
            <footer className="flex justify-end border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
            </footer>
          )}
        </div>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            if (!open && !createDivisionMutation.isPending) {
              setIsAddDialogOpen(false);
              setNewDivisionCode("");
              setNewDivisionName("");
            }
          }}
        >
          <DialogContent>
            <form onSubmit={submitNewDivision} className="grid gap-6">
              <DialogHeader>
                <DialogTitle>{"เพิ่มฝ่ายใหม่"}</DialogTitle>
                <DialogDescription>
                  {"กรอกรหัสและชื่อฝ่ายที่ต้องการเพิ่มเข้าสู่ระบบ"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="new-division-code"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"รหัสฝ่าย"}
                  </label>
                  <Input
                    id="new-division-code"
                    name="code"
                    autoFocus
                    required
                    value={newDivisionCode}
                    onChange={(event) => setNewDivisionCode(event.target.value)}
                    disabled={createDivisionMutation.isPending}
                    placeholder="eg. 01 (ต้องมีอย่างน้อย 2 ตัว และไม่เกิน 3)"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="new-division-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"ชื่อฝ่าย"}
                  </label>
                  <Input
                    id="new-division-name"
                    name="name"
                    required
                    value={newDivisionName}
                    onChange={(event) => setNewDivisionName(event.target.value)}
                    disabled={createDivisionMutation.isPending}
                    placeholder="eg. ฝ่ายผลิต"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={createDivisionMutation.isPending}
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setNewDivisionCode("");
                    setNewDivisionName("");
                  }}
                >
                  {"ยกเลิก"}
                </Button>
                <Button
                  type="submit"
                  disabled={createDivisionMutation.isPending}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {createDivisionMutation.isPending ? "กำลังเพิ่ม..." : "เพิ่ม"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={divisionToDelete !== null}
          onOpenChange={(open) => {
            if (!open && !deleteDivisionMutation.isPending) {
              setDivisionToDelete(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{"ยืนยันการลบฝ่าย"}</DialogTitle>
              <DialogDescription>
                ต้องการลบฝ่าย “{divisionToDelete?.name}” (รหัส{" "}
                {divisionToDelete?.code}) ใช่หรือไม่? การดำเนินการนี้ไม่สามารถ
                ย้อนกลับได้
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDivisionToDelete(null)}
                disabled={deleteDivisionMutation.isPending}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteDivisionMutation.isPending}
              >
                {deleteDivisionMutation.isPending ? "กำลังลบ..." : "ลบฝ่าย"}
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
          <DialogContent className="md:max-w-lg">
            <DialogHeader>
              <DialogTitle>ยืนยันการเปลี่ยนแปลงข้อมูลฝ่าย</DialogTitle>
              <DialogDescription>
                ตรวจสอบข้อมูลฝ่ายเดิมและข้อมูลใหม่ก่อนบันทึกการเปลี่ยนแปลง
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid content-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-slate-800">
                  ข้อมูลเดิมก่อนแก้ไข
                </h2>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Code:</span> {backup?.code}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Name:</span> {backup?.name}
                </p>
              </div>
              <div className="grid content-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <h2 className="text-sm font-semibold text-indigo-900">
                  ข้อมูลใหม่ที่ต้องการบันทึก
                </h2>
                <p className="text-sm text-indigo-800">
                  <span className="font-medium">Code:</span>{" "}
                  {pendingSubmission?.code}
                </p>
                <p className="text-sm text-indigo-800">
                  <span className="font-medium">Name:</span>{" "}
                  {pendingSubmission?.name}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              ยืนยันเพื่อบันทึกการเปลี่ยนชื่อฝ่าย
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingSubmission(null)}
                disabled={updateDivisionMutation.isPending}
              >
                แก้ไขต่อ
              </Button>
              <Button
                type="button"
                onClick={confirmSubmission}
                disabled={updateDivisionMutation.isPending}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {updateDivisionMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
