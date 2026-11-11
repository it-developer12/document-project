"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Pencil, Plus, X } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import type { CompanyRecord } from "@/api/utils";
import { useCompanyList } from "@/hooks/create-form";
import { useCreateCompany } from "@/hooks/create-utils";
import { useUpdateCompany } from "@/hooks/update-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Page() {
  const { data: companies, isPending, isError, refetch } = useCompanyList();
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<CompanyRecord | null>(null);
  const [editedCompanyName, setEditedCompanyName] = useState("");
  const [editedCompanyNameEn, setEditedCompanyNameEn] = useState("");
  const [editedCompanyLogo, setEditedCompanyLogo] = useState<File | null>(null);
  const [editedCompanyLogoPreview, setEditedCompanyLogoPreview] = useState<
    string | null
  >(null);
  const [newCompanyLogoPreview, setNewCompanyLogoPreview] = useState<
    string | null
  >(null);
  const editedCompanyLogoPreviewRef = useRef<string | null>(null);
  const editedCompanyLogoInputRef = useRef<HTMLInputElement | null>(null);
  const newCompanyLogoPreviewRef = useRef<string | null>(null);
  const newCompanyLogoInputRef = useRef<HTMLInputElement | null>(null);
  const createCompanyFormRef = useRef<HTMLFormElement | null>(null);
  const companyList = companies ?? [];

  useEffect(
    () => () => {
      if (editedCompanyLogoPreviewRef.current) {
        URL.revokeObjectURL(editedCompanyLogoPreviewRef.current);
      }
      if (newCompanyLogoPreviewRef.current) {
        URL.revokeObjectURL(newCompanyLogoPreviewRef.current);
      }
    },
    [],
  );

  function clearEditedCompanyLogo() {
    if (editedCompanyLogoPreviewRef.current) {
      URL.revokeObjectURL(editedCompanyLogoPreviewRef.current);
      editedCompanyLogoPreviewRef.current = null;
    }
    setEditedCompanyLogo(null);
    setEditedCompanyLogoPreview(null);
    if (editedCompanyLogoInputRef.current) {
      editedCompanyLogoInputRef.current.value = "";
    }
  }

  function resetCompanyEdit() {
    clearEditedCompanyLogo();
    setCompanyToEdit(null);
    setEditedCompanyName("");
  }

  function openCompanyEdit(company: CompanyRecord) {
    setCompanyToEdit(company);
    setEditedCompanyName(company.name);
    setEditedCompanyNameEn(company.name_en)
    clearEditedCompanyLogo();
  }

  function updateEditedCompanyLogo(file: File | undefined) {
    if (!file) return;

    const isSupportedImage =
      ["image/png", "image/jpeg"].includes(file.type) ||
      /\.(png|jpe?g)$/i.test(file.name);
    if (!isSupportedImage) {
      if (editedCompanyLogoInputRef.current) {
        editedCompanyLogoInputRef.current.value = "";
      }
      toast.error("Choose a PNG or JPEG logo.");
      return;
    }

    if (editedCompanyLogoPreviewRef.current) {
      URL.revokeObjectURL(editedCompanyLogoPreviewRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    editedCompanyLogoPreviewRef.current = previewUrl;
    setEditedCompanyLogo(file);
    setEditedCompanyLogoPreview(previewUrl);
  }

  function clearNewCompanyLogo() {
    if (newCompanyLogoPreviewRef.current) {
      URL.revokeObjectURL(newCompanyLogoPreviewRef.current);
      newCompanyLogoPreviewRef.current = null;
    }
    setNewCompanyLogoPreview(null);
    if (newCompanyLogoInputRef.current) {
      newCompanyLogoInputRef.current.value = "";
    }
  }

  function updateNewCompanyLogo(file: File | undefined) {
    if (!file) return;

    const isSupportedImage =
      ["image/png", "image/jpeg"].includes(file.type) ||
      /\.(png|jpe?g)$/i.test(file.name);
    if (!isSupportedImage) {
      clearNewCompanyLogo();
      toast.error("Choose a PNG or JPEG logo.");
      return;
    }

    if (newCompanyLogoPreviewRef.current) {
      URL.revokeObjectURL(newCompanyLogoPreviewRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    newCompanyLogoPreviewRef.current = previewUrl;
    setNewCompanyLogoPreview(previewUrl);
  }

  function resetNewCompanyForm() {
    createCompanyFormRef.current?.reset();
    clearNewCompanyLogo();
  }

  function submitNewCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const companyData = new FormData(event.currentTarget);
    const code = String(companyData.get("code") ?? "").trim();
    const name = String(companyData.get("name") ?? "").trim();
    const nameEn = String(companyData.get("name_en") ?? "").trim();
    const logo = companyData.get("logo");

    if (!code || !name) {
      toast.error("Company code and name are required.");
      return;
    }

    companyData.set("code", code);
    companyData.set("name", name);
    if (nameEn) {
      companyData.set("name_en", nameEn);
    } else {
      companyData.delete("name_en");
    }

    if (logo instanceof File && logo.size > 0) {
      const isSupportedImage =
        ["image/png", "image/jpeg"].includes(logo.type) ||
        /\.(png|jpe?g)$/i.test(logo.name);
      if (!isSupportedImage) {
        toast.error("Choose a PNG or JPEG logo.");
        return;
      }
    } else {
      companyData.delete("logo");
    }

    createCompanyMutation.mutate(companyData, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        resetNewCompanyForm();
      },
    });
  }

  function submitCompanyEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyToEdit) return;

    const name = editedCompanyName.trim();
    const nameEn = editedCompanyNameEn.trim();
    if (!name) {
      toast.error("ชื่อบริษัทไม่สามารถว่างได้");
      return;
    }
    if (name === companyToEdit.name && !editedCompanyLogo && nameEn === companyToEdit.name_en) {
      toast.info("ไม่มีการเปลี่ยนแปลงข้อมูล");
      return;
    }

    const companyData = new FormData();
    companyData.append("name", name);
    companyData.append("nameEn", nameEn)
    if (editedCompanyLogo) companyData.append("logo", editedCompanyLogo);

    updateCompanyMutation.mutate(
      { companyId: companyToEdit.code, companyData },
      { onSuccess: resetCompanyEdit },
    );
  }

  return (
    <section className="min-h-screen w-full bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Administration</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {"บริษัททั้งหมด"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {"แก้ไขชื่อและโลโก้ของบริษัทในระบบ"}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={createCompanyMutation.isPending}
            className="h-10 rounded-lg bg-indigo-600 px-4 text-white hover:bg-indigo-700"
          >
            <Plus aria-hidden="true" />
            {"เพิ่มบริษัท"}
          </Button>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(8rem,0.45fr)_minmax(0,1fr)_minmax(10rem,0.8fr)_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid sm:px-6">
            <span>Company code</span>
            <span>Company name</span>
            <span>Company logo</span>
            <span className="sr-only">Actions</span>
          </div>

          {isPending ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              Loading companies…
            </p>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center sm:px-6">
              <p className="text-sm text-red-600">
                Could not load company data.
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
          ) : companyList.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              No companies found.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {companyList.map((company) => (
                <li
                  key={company.code}
                  className="grid grid-cols-1 items-center gap-4 px-5 py-4 sm:grid-cols-[minmax(8rem,0.45fr)_minmax(0,1fr)_minmax(10rem,0.8fr)_auto] sm:px-6"
                >
                  <div className="min-w-0">
                    <span className="mb-1 block text-xs font-medium text-slate-500 sm:hidden">
                      Company code
                    </span>
                    <p className="truncate text-sm font-medium text-slate-700">
                      {company.code}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <span className="mb-1 block text-xs font-medium text-slate-500 sm:hidden">
                      Company name
                    </span>
                    <p className="truncate text-sm font-medium text-slate-800">
                      {company.name}
                    </p>
                  </div>
                  <div className="flex min-w-0 items-center">
                    {company.logo ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "")}/${company.logo.replace(/^\/+/, "")}`}
                        alt={`${company.name} logo`}
                        width={64}
                        height={64}
                        unoptimized
                        className="size-12 shrink-0 rounded-md border border-slate-200 bg-white object-contain p-1"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No logo</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label={`Edit ${company.name}`}
                    title="Edit company"
                    disabled={updateCompanyMutation.isPending}
                    onClick={() => openCompanyEdit(company)}
                    className="size-9 shrink-0 rounded-lg border-slate-200 bg-white p-0"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Dialog
          open={companyToEdit !== null}
          onOpenChange={(open) => {
            if (!open && !updateCompanyMutation.isPending) {
              resetCompanyEdit();
            }
          }}
        >
          <DialogContent>
            <form onSubmit={submitCompanyEdit} className="grid gap-6">
              <DialogHeader>
                <DialogTitle>{"แก้ไขข้อมูลบริษัท"}</DialogTitle>
                <DialogDescription>
                  {companyToEdit
                    ? `แก้ไขข้อมูลของ ${companyToEdit.name} (${companyToEdit.code})`
                    : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="edit-company-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"ชื่อบริษัท"}
                  </label>
                  <Input
                    id="edit-company-name"
                    name="name"
                    required
                    autoFocus
                    value={editedCompanyName}
                    onChange={(event) =>
                      setEditedCompanyName(event.target.value)
                    }
                    disabled={updateCompanyMutation.isPending}
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="edit-company-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"ชื่อบริษัท (EN)"}
                  </label>
                  <Input
                    id="edit-company-name-en"
                    name="name"
                    required
                    value={editedCompanyNameEn}
                    onChange={(event) =>
                      setEditedCompanyNameEn(event.target.value)
                    }
                    disabled={updateCompanyMutation.isPending}
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="edit-company-logo"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"โลโก้บริษัท"}
                  </label>
                  {editedCompanyLogoPreview ? (
                    <div className="flex items-center gap-3">
                      <Image
                        src={editedCompanyLogoPreview}
                        alt="New company logo preview"
                        width={64}
                        height={64}
                        unoptimized
                        className="size-16 rounded-md border border-indigo-200 bg-white object-contain p-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        aria-label="Remove selected company logo"
                        disabled={updateCompanyMutation.isPending}
                        onClick={clearEditedCompanyLogo}
                        className="size-9 rounded-lg border-slate-200 bg-white p-0"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                  ) : companyToEdit?.logo ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "")}/${companyToEdit.logo.replace(/^\/+/, "")}`}
                      alt={`${companyToEdit.name} current logo`}
                      width={64}
                      height={64}
                      unoptimized
                      className="size-16 rounded-md border border-slate-200 bg-white object-contain p-1"
                    />
                  ) : (
                    <p className="text-sm text-slate-400">No logo uploaded.</p>
                  )}
                  <Input
                    ref={editedCompanyLogoInputRef}
                    id="edit-company-logo"
                    name="logo"
                    type="file"
                    accept="image/png,image/jpeg"
                    disabled={updateCompanyMutation.isPending}
                    onChange={(event) =>
                      updateEditedCompanyLogo(event.target.files?.[0])
                    }
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-slate-500">
                    {"รองรับไฟล์ PNG และ JPEG"}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={updateCompanyMutation.isPending}
                  onClick={resetCompanyEdit}
                >
                  {"ยกเลิก"}
                </Button>
                <Button
                  type="submit"
                  disabled={updateCompanyMutation.isPending}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {updateCompanyMutation.isPending ? "Saving..." : "บันทึก"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            if (!open && !createCompanyMutation.isPending) {
              setIsAddDialogOpen(false);
              resetNewCompanyForm();
            }
          }}
        >
          <DialogContent>
            <form
              ref={createCompanyFormRef}
              onSubmit={submitNewCompany}
              className="grid gap-6"
            >
              <DialogHeader>
                <DialogTitle>{"เพิ่มบริษัทใหม่"}</DialogTitle>
                <DialogDescription>
                  {"กรอกรายละเอียดบริษัทที่ต้องการเพิ่มเข้าสู่ระบบ"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="new-company-code"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"รหัสบริษัท"}
                  </label>
                  <Input
                    id="new-company-code"
                    name="code"
                    required
                    disabled={createCompanyMutation.isPending}
                    placeholder="เช่น COMPANY01"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="new-company-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"ชื่อบริษัท"}
                  </label>
                  <Input
                    id="new-company-name"
                    name="name"
                    required
                    disabled={createCompanyMutation.isPending}
                    placeholder="ชื่อบริษัท"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="new-company-name-en"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"ชื่อบริษัทภาษาอังกฤษ (ถ้ามี)"}
                  </label>
                  <Input
                    id="new-company-name-en"
                    name="name_en"
                    disabled={createCompanyMutation.isPending}
                    placeholder="Company name"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="new-company-logo"
                    className="text-sm font-medium text-slate-700"
                  >
                    {"โลโก้บริษัท (ถ้ามี)"}
                  </label>
                  <Input
                    ref={newCompanyLogoInputRef}
                    id="new-company-logo"
                    name="logo"
                    type="file"
                    accept="image/png,image/jpeg"
                    disabled={createCompanyMutation.isPending}
                    className="cursor-pointer"
                    onChange={(event) =>
                      updateNewCompanyLogo(event.target.files?.[0])
                    }
                  />
                  {newCompanyLogoPreview && (
                    <div className="flex items-center gap-3">
                      <Image
                        src={newCompanyLogoPreview}
                        alt="New company logo preview"
                        width={64}
                        height={64}
                        unoptimized
                        className="size-16 rounded-md border border-slate-200 bg-white object-contain p-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        aria-label="Remove selected company logo"
                        title="Remove selected logo"
                        disabled={createCompanyMutation.isPending}
                        onClick={clearNewCompanyLogo}
                        className="size-9 rounded-lg border-slate-200 bg-white p-0"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    {"รองรับไฟล์ PNG และ JPEG"}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={createCompanyMutation.isPending}
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetNewCompanyForm();
                  }}
                >
                  {"ยกเลิก"}
                </Button>
                <Button
                  type="submit"
                  disabled={createCompanyMutation.isPending}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {createCompanyMutation.isPending ? "Adding..." : "เพิ่ม"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
