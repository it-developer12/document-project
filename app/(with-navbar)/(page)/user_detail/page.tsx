"use client";

import {
  useRef,
  useState,
  useEffect,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import {
  BadgeCheck,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleUserRound,
  IdCard,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { useUpdateUserInfo } from "@/hooks/user-update-info";

type UserProfileDraft = {
  user_name: string;
  employee_code: string;
  title: User["user_info"]["title"];
  firstName: string;
  lastName: string;
  firstNameEn: string;
  lastNameEn: string;
  email: string;
  signature: string;
};

type ProfileTab = "account" | "details";

const tabs: { id: ProfileTab; label: string; description: string }[] = [
  {
    id: "account",
    label: "บัญชีผู้ใช้",
    description: "Login name and account access",
  },
  {
    id: "details",
    label: "ข้อมูลของผู้ใช้",
    description: "Personal and work information",
  },
];

function getDraft(user: User): UserProfileDraft {
  return {
    user_name: user.user_name,
    employee_code: user.user_info.employee_code,
    title: user.user_info.title,
    firstName: user.user_info.firstName,
    lastName: user.user_info.lastName,
    firstNameEn: user.user_info.firstNameEn ?? "",
    lastNameEn: user.user_info.lastNameEn ?? "",
    email: user.user_info.email ?? "",
    signature: user.signature ?? "",
  };
}

function formatDate(value: Date | string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  disabled = false,
}: {
  label: string;
  name: Exclude<keyof UserProfileDraft, "title">;
  value: string;
  onChange: Dispatch<SetStateAction<UserProfileDraft | null>>;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <Input
        name={name}
        type={type}
        value={value}
        onChange={(event) =>
          onChange((current) =>
            current
              ? { ...current, [name]: event.target.value }
              : current,
          )
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="h-11 rounded-lg border-slate-200 bg-white px-3 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
      />
    </label>
  );
}

function ReadOnlyInfo({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  const userUpdateMutation = useUpdateUserInfo();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<UserProfileDraft | null>((user ? getDraft(user) : null));

  useEffect(() => {
    return () => {
      if (signaturePreviewUrl) URL.revokeObjectURL(signaturePreviewUrl);
    };
  }, [signaturePreviewUrl]);

  if (!user || !draft) {
    return (
      <section className="min-h-screen w-full bg-slate-50 p-6 md:p-10">
        <div className="mx-auto max-w-5xl animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-72 rounded bg-slate-100" />
          <div className="mt-10 h-48 rounded-xl bg-slate-100" />
        </div>
      </section>
    );
  }

  const fullName = [user.user_info.firstName, user.user_info.lastName]
    .filter(Boolean)
    .join(" ");
  const initials = [user.user_info.firstNameEn, user.user_info.lastNameEn]
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();
  const role = user.user_info.role.toLowerCase();
  const isActive = user.user_info.status;

  function cancelChanges() {
    if (!user) return;
    setDraft(getDraft(user));
    setSignatureFile(null);
    setSignaturePreviewUrl(null);
    if (signatureInputRef.current) signatureInputRef.current.value = "";
  }

  function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !draft || isSubmitting) return;

    if (!draft.user_name.trim()) {
      toast.error("Username is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      // formData.append("user_name", draft.user_name);
      formData.append("title", draft.title ?? "");
      formData.append("firstName", draft.firstName);
      formData.append("lastName", draft.lastName);
      formData.append("firstNameEn", draft.firstNameEn ?? "");
      formData.append("lastNameEn", draft.lastNameEn ?? "");
      formData.append("email", draft.email ?? "");
      if (signatureFile) {
        formData.append("signature", signatureFile);
      }
      userUpdateMutation.mutate({ userId: user.user_info.id, userData: formData });

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen w-full min-w-0 overflow-x-clip bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto min-w-0 max-w-5xl">
        <header className="mb-7">
          <p className="text-sm font-semibold text-indigo-600">My profile</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            User details
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {"ดูและแก้ไขข้อมูลบัญชีของคุณ"}
          </p>
        </header>

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-lg font-bold text-indigo-700">
              {initials || <UserRound aria-hidden="true" className="size-6" />}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900">
                {fullName || "Your profile"}
              </h2>
              <p className="mt-0.5 truncate text-sm text-slate-500">
                {user.user_info.email || user.user_name}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
                }`}
            >
              <span
                className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"
                  }`}
              />
              {isActive ? "Active" : "Inactive"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-600">
              <ShieldCheck aria-hidden="true" className="size-3.5" />
              {role}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 pt-2 sm:px-8">
            <div aria-label="Profile sections" className="flex gap-7" role="tablist">
              {tabs.map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`${tab.id}-tab`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`${tab.id}-panel`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative -mb-px flex min-h-14 flex-col justify-center border-b-2 text-left transition-colors ${selected
                        ? "border-indigo-600 text-indigo-700"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    <span className="text-sm font-semibold">{tab.label}</span>
                    <span className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                      {tab.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={saveChanges} aria-busy={isSubmitting} className="min-w-0">
            {activeTab === "account" ? (
              <div
                id="account-panel"
                role="tabpanel"
                aria-labelledby="account-tab"
                className="p-5 sm:p-8"
              >
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-slate-900">
                    {"ข้อมูลบัญชีผู้ใช้"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {"รายละเอียดข้อมูลบัญชีผู้ใช้"}
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="ชื่อผู้ใช้"
                    name="user_name"
                    value={draft.user_name}
                    onChange={setDraft}
                    autoComplete="username"
                    placeholder="Enter your username"
                    disabled
                  />
                  <ReadOnlyInfo
                    label="ตำแหน่งของบัญชีผู้ใช้"
                    value={user.user_info.role}
                    icon={ShieldCheck}
                  />
                  <ReadOnlyInfo
                    label="สถานะของบัญชีผู้ใช้"
                    value={user.user_info.status ? "Active" : "Inactive"}
                    icon={BadgeCheck}
                  />
                  <ReadOnlyInfo
                    label="สมัครสมาชิกตั้งแต่"
                    value={formatDate(user.user_info.createdAt)}
                    icon={CalendarDays}
                  />
                </div>
              </div>
            ) : (
              <div
                id="details-panel"
                role="tabpanel"
                aria-labelledby="details-tab"
                className="min-w-0 p-5 sm:p-8"
              >
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-slate-900">
                    {"ข้อมูลส่วนตัว"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {"แก้ไขข้อมูลส่วนตัว"}
                  </p>
                </div>

                <div className="grid min-w-0 gap-x-5 gap-y-5 sm:grid-cols-2">
                  <Field
                    label="รหัสพนักงาน"
                    name="employee_code"
                    value={draft.employee_code}
                    onChange={setDraft}
                    placeholder="Enter employee code"
                    disabled
                  />
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    {"คำนำหน้าชื่อ"}
                    <select
                      name="title"
                      value={draft.title}
                      onChange={(event) => {
                        const title = event.target.value;
                        if (title === "MR" || title === "MS" || title === "MRS") {
                          setDraft((current) =>
                            current ? { ...current, title } : current,
                          );
                        }
                      }}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-3 focus:ring-indigo-400/20"
                    >
                      <option value="MR">Mr.</option>
                      <option value="MS">Ms.</option>
                      <option value="MRS">Mrs.</option>
                    </select>
                  </label>
                  <Field
                    label="ชื่อจริง"
                    name="firstName"
                    value={draft.firstName}
                    onChange={setDraft}
                    autoComplete="given-name"
                    placeholder="Enter first name"
                  />
                  <Field
                    label="นามสกุล"
                    name="lastName"
                    value={draft.lastName}
                    onChange={setDraft}
                    autoComplete="family-name"
                    placeholder="Enter last name"
                  />
                  <Field
                    label="ชื่อจริง (English)"
                    name="firstNameEn"
                    value={draft.firstNameEn}
                    onChange={setDraft}
                    placeholder="Enter English first name"
                  />
                  <Field
                    label="นามสกุล (English)"
                    name="lastNameEn"
                    value={draft.lastNameEn}
                    onChange={setDraft}
                    placeholder="Enter English last name"
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Email"
                      name="email"
                      value={draft.email}
                      onChange={setDraft}
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="grid gap-3 text-sm font-medium text-slate-700">
                      <span>Signature image</span>
                      <div className="grid min-w-0 gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
                        {draft.signature && (
                          <div className="grid content-start gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Current signature
                            </p>
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "")}/${draft.signature.replace(/^\/+/, "")}`}
                              alt="Current saved signature"
                              width={320}
                              height={128}
                              unoptimized
                              className="h-32 w-full rounded-lg border border-slate-200 bg-white object-contain p-2"
                            />
                          </div>
                        )}
                        {signaturePreviewUrl && (
                          <div className="grid content-start gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                              New signature preview
                            </p>
                            <Image
                              src={signaturePreviewUrl}
                              alt="Preview of the new signature"
                              width={320}
                              height={128}
                              unoptimized
                              className="h-32 w-full rounded-lg border border-indigo-200 bg-white object-contain p-2"
                            />
                            <p className="truncate text-xs font-normal text-slate-500">
                              {signatureFile?.name}
                            </p>
                          </div>
                        )}
                        {!draft.signature && !signaturePreviewUrl && (
                          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-sm font-normal text-slate-500 sm:col-span-2">
                            No signature uploaded yet
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                          <label
                            htmlFor="signature-file"
                            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            <Upload aria-hidden="true" className="size-4" />
                            {signatureFile ? "Choose another file" : "Upload new signature"}
                          </label>
                          {signatureFile && (
                            <Button
                              type="button"
                              variant="outline"
                              aria-label="Remove new signature"
                              onClick={() => {
                                setSignatureFile(null);
                                setSignaturePreviewUrl(null);
                                if (signatureInputRef.current) {
                                  signatureInputRef.current.value = "";
                                }
                              }}
                              className="size-9 rounded-lg border-slate-200 bg-white p-0"
                            >
                              <X aria-hidden="true" className="size-4" />
                            </Button>
                          )}
                          <span className="text-xs font-normal text-slate-500">
                            PNG or JPEG
                          </span>
                        </div>
                        <Input
                          ref={signatureInputRef}
                          id="signature-file"
                          name="signature"
                          type="file"
                          accept="image/png,image/jpeg"
                          className="sr-only"
                          style={{ width: 1, height: 1 }}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const isSupportedImage =
                              ["image/png", "image/jpeg"].includes(file.type) ||
                              /\.(png|jpe?g)$/i.test(file.name);
                            if (!isSupportedImage) {
                              event.target.value = "";
                              toast.error("Choose a PNG or JPEG image.");
                              return;
                            }
                            setSignatureFile(file);
                            setSignaturePreviewUrl(URL.createObjectURL(file));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
                  <ReadOnlyInfo
                    label="User ID"
                    value={user.user_info.id}
                    icon={IdCard}
                  />
                  <ReadOnlyInfo
                    label="Position ID"
                    value={user.user_info.positionId || "Not assigned"}
                    icon={BriefcaseBusiness}
                  />
                  <ReadOnlyInfo
                    label="Company ID"
                    value={user.user_info.companyId || "Not assigned"}
                    icon={Building2}
                  />
                  <ReadOnlyInfo
                    label="Last profile update"
                    value={formatDate(user.user_info.updatedAt)}
                    icon={CalendarDays}
                  />
                </div>
              </div>
            )}

            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="text-xs text-slate-500">
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelChanges}
                  className="h-10 rounded-lg border-slate-200 bg-white px-4"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 rounded-lg bg-indigo-600 px-4 text-white hover:bg-indigo-700"
                >
                  <Save aria-hidden="true" />
                  {isSubmitting ? "Saving..." : "บันทึกการแก้ไข"}
                  <Check aria-hidden="true" />
                </Button>
              </div>
            </footer>
          </form>
        </div>
      </div>
    </section>
  );
}
