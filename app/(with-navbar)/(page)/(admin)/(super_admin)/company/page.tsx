"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useCompanyList } from "@/hooks/create-form";
import { useUpdateCompany } from "@/hooks/update-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Page() {
  const { data: companies, isPending, isError, refetch } = useCompanyList();
  const updateCompanyMutation = useUpdateCompany();
  const [editedNames, setEditedNames] = useState<Record<string, string>>({});
  const [logoFiles, setLogoFiles] = useState<Record<string, File>>({});
  const [logoPreviewUrls, setLogoPreviewUrls] = useState<Record<string, string>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const logoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const logoPreviewUrlsRef = useRef<Record<string, string>>({});
  const companyList = companies ?? [];

  useEffect(
    () => () => {
      Object.values(logoPreviewUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
    },
    [],
  );

  function updateCompanyName(code: string, name: string) {
    setEditedNames((current) => ({ ...current, [code]: name }));
  }

  function updateCompanyLogo(code: string, file: File | null) {
    const previousPreview = logoPreviewUrlsRef.current[code];
    if (previousPreview) URL.revokeObjectURL(previousPreview);

    let nextPreview: string | null = null;
    if (file) {
      nextPreview = URL.createObjectURL(file);
      logoPreviewUrlsRef.current[code] = nextPreview;
    } else {
      delete logoPreviewUrlsRef.current[code];
    }

    setLogoPreviewUrls((current) => {
      const next = { ...current };
      if (nextPreview) {
        next[code] = nextPreview;
      } else {
        delete next[code];
      }
      return next;
    });

    setLogoFiles((current) => {
      const next = { ...current };
      if (file) {
        next[code] = file;
      } else {
        delete next[code];
      }
      return next;
    });
  }

  async function submitChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const changedCompanies = companyList.filter((company) => {
      const name = (editedNames[company.code] ?? company.name).trim();
      return name !== company.name || Boolean(logoFiles[company.code]);
    });

    if (changedCompanies.length === 0) {
      toast.info("There are no company changes to save.");
      return;
    }

    const invalidCompany = changedCompanies.find(
      (company) => !(editedNames[company.code] ?? company.name).trim(),
    );
    if (invalidCompany) {
      toast.error("Company name is required.");
      return;
    }

    setIsSubmitting(true);
    const results = await Promise.allSettled(
      changedCompanies.map((company) => {
        const companyData = new FormData();
        companyData.append(
          "name",
          (editedNames[company.code] ?? company.name).trim(),
        );
        const logo = logoFiles[company.code];
        if (logo) companyData.append("logo", logo);

        return updateCompanyMutation.mutateAsync({
          companyId: company.code,
          companyData,
        });
      }),
    );

    const succeededCodes = changedCompanies
      .filter((_company, index) => results[index].status === "fulfilled")
      .map((company) => company.code);

    if (succeededCodes.length > 0) {
      setEditedNames((current) => {
        const next = { ...current };
        succeededCodes.forEach((code) => delete next[code]);
        return next;
      });
      setLogoFiles((current) => {
        const next = { ...current };
        succeededCodes.forEach((code) => delete next[code]);
        return next;
      });
      setLogoPreviewUrls((current) => {
        const next = { ...current };
        succeededCodes.forEach((code) => delete next[code]);
        return next;
      });
      succeededCodes.forEach((code) => {
        const previewUrl = logoPreviewUrlsRef.current[code];
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        delete logoPreviewUrlsRef.current[code];
        const input = logoInputRefs.current[code];
        if (input) input.value = "";
      });
    }

    setIsSubmitting(false);
  }

  return (
    <section className="min-h-screen w-full bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-indigo-600">Administration</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {"บริษัททั้งหมด"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {"แก้ไขชื่อและโลโก้ของบริษัทในระบบ"}
          </p>
        </header>

        <form
          onSubmit={submitChanges}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="hidden grid-cols-[minmax(8rem,0.45fr)_minmax(0,1fr)_minmax(10rem,0.8fr)] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid sm:px-6">
            <span>Company code</span>
            <span>Company name</span>
            <span>Company logo</span>
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
                  className="grid grid-cols-1 items-center gap-4 px-5 py-4 sm:grid-cols-[minmax(8rem,0.45fr)_minmax(0,1fr)_minmax(10rem,0.8fr)] sm:px-6"
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
                    <label
                      className="mb-1 block text-xs font-medium text-slate-500 sm:sr-only"
                      htmlFor={`company-${company.code}`}
                    >
                      Company name
                    </label>
                    <Input
                      id={`company-${company.code}`}
                      name={`company-${company.code}`}
                      value={editedNames[company.code] ?? company.name}
                      onChange={(event) =>
                        updateCompanyName(company.code, event.target.value)
                      }
                      disabled={isSubmitting}
                      className="h-10 rounded-lg border-slate-200 bg-white px-3 text-sm shadow-none focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
                    />
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {company.logo && (
                        <div className="grid justify-items-center gap-1">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "")}/${company.logo.replace(/^\/+/, "")}`}
                            alt={`${company.name} current logo`}
                            width={64}
                            height={64}
                            unoptimized
                            className="size-12 shrink-0 rounded-md border border-slate-200 bg-white object-contain p-1"
                          />
                          <span className="text-[10px] text-slate-500">
                            Current
                          </span>
                        </div>
                      )}
                      {logoFiles[company.code] &&
                        logoPreviewUrls[company.code] && (
                          <div className="grid justify-items-center gap-1">
                            <Image
                              src={logoPreviewUrls[company.code]}
                              alt={`${company.name} new logo preview`}
                              width={64}
                              height={64}
                              unoptimized
                              className="size-12 shrink-0 rounded-md border border-indigo-200 bg-white object-contain p-1"
                            />
                            <span className="text-[10px] font-medium text-indigo-700">
                              New
                            </span>
                          </div>
                        )}
                    </div>
                    <label
                      htmlFor={`company-logo-${company.code}`}
                      className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition ${isSubmitting ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-slate-100"}`}
                    >
                      <ImagePlus aria-hidden="true" className="size-4" />
                      <span>{logoFiles[company.code] ? "Change" : "Choose"}</span>
                    </label>
                    {logoFiles[company.code] ? (
                      <>
                        <span className="min-w-0 truncate text-xs text-slate-500">
                          {logoFiles[company.code].name}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          aria-label={`Remove logo for ${company.name}`}
                          disabled={isSubmitting}
                          onClick={() => {
                            updateCompanyLogo(company.code, null);
                            const input = logoInputRefs.current[company.code];
                            if (input) input.value = "";
                          }}
                          className="size-8 shrink-0 rounded-lg border-slate-200 bg-white p-0"
                        >
                          <X aria-hidden="true" className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="truncate text-xs text-slate-400">
                        No logo selected
                      </span>
                    )}
                    <Input
                      ref={(input) => {
                        logoInputRefs.current[company.code] = input;
                      }}
                      id={`company-logo-${company.code}`}
                      name={`company-logo-${company.code}`}
                      type="file"
                      accept="image/png,image/jpeg"
                      disabled={isSubmitting}
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const isSupportedImage =
                          ["image/png", "image/jpeg"].includes(file.type) ||
                          /\.(png|jpe?g)$/i.test(file.name);
                        if (!isSupportedImage) {
                          event.target.value = "";
                          toast.error("Choose a PNG or JPEG logo.");
                          return;
                        }
                        updateCompanyLogo(company.code, file);
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isPending && !isError && companyList.length > 0 && (
            <footer className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-slate-500">
                {""}
              </p>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 rounded-lg bg-indigo-600 px-4 text-white hover:bg-indigo-700"
              >
                {isSubmitting ? "Saving..." : "บันทึก"}
              </Button>
            </footer>
          )}
        </form>

      </div>
    </section>
  );
}
