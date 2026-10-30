"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from '@iconify/react';
import UserNav from "./UserNav";
import { useDocumentStore } from "@/store/document.store";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  role?: User["user_info"]["role"][];
  description?: string;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", description: "", icon: "material-symbols:dashboard-outline-rounded", role: ["USER", "ADMIN", "SUPER_ADMIN"] },
  { href: "/document_list", label: "รายการเอกสาร", description: "เลือกแบบฟอร์มสำหรับการเปิดเอกสาร", icon: "fluent-mdl2:document-set", role: ["USER", "ADMIN", "SUPER_ADMIN"] },
  {
    href: "/action",
    label: "งานที่ต้องดำเนินการ",
    icon: "fluent:document-lightning-48-regular",
    description: "ตรวจสอบงานที่รออนุมัติหรือดำเนินการ",
    role: ["USER", "ADMIN", "SUPER_ADMIN"],
    children: [
      {
        href: "/approve",
        label: "อนุมัติเอกสาร",
        icon: "carbon:document-set",
        description: "ตรวจสอบและตัดสินใจอนุมัติ",
      },
      {
        href: "/process",
        label: "ดำเนินการตามคำขอ",
        icon: "streamline-ultimate:loading-bold",
        description: "จัดการงานจากเอกสารที่อนุมัติแล้ว",
      },
      {
        href: "/complete",
        label: "ปิดจบเอกสาร",
        icon: "material-symbols:check-box-outline",
        description: "ดำเนินการเพื่อให้เอกสารสำเร็จ"
      }
    ]
  },
  {
    href: "/document",
    label: "จัดการแบบฟอร์ม",
    icon: "fluent-mdl2:document-set",
    role: ["ADMIN"],
    children: [
      { href: "/create", label: "สร้างแบบฟอร์ม", description: "กำหนดแบบฟอร์มและขั้นตอนการอนุมัติ", icon: "gridicons:create" },
      { href: "/update_form", label: "แก้ไขแบบฟอร์ม", description: "ปรับปรุงแบบฟอร์มที่มีอยู่", icon: "material-symbols:edit-document-outline" },
    ],
  },
  // ติดตามความคืบหน้าของเอกสาร  ภาพรวมเอกสารและงานของคุณ ดูและแก้ไขข้อมูลบัญชีของคุณ
  { href: "/tracking", label: "ตรวจสอบสถานะ", description: "", icon: "iconamoon:search-light", role: ["USER", "ADMIN", "SUPER_ADMIN"] },
  {
    href: "/admin",
    label: "จัดการระบบ",
    icon: "pajamas:admin",
    role: ["ADMIN"],
    children: [
      { href: "/users", label: "จัดการผู้ใช้งาน", description: "เพิ่มและแก้ไขบัญชีผู้ใช้งาน", icon: "bx:user" },
      { href: "/position", label: "จัดการตำแหน่ง", description: "กำหนดตำแหน่งงานในองค์กร", icon: "carbon:building" },
      { href: "/division", label: "จัดการฝ่าย", description: "จัดการฝ่ายภายในองค์กร", icon: "arcticons:office-reader" },
      { href: "/department", label: "จัดการแผนก", description: "จัดการแผนกภายในองค์กร", icon: "carbon:building" },
      { href: "/company", label: "จัดการบริษัท", description: "จัดการข้อมูลบริษัท", icon: "carbon:enterprise" },
    ],
  },
  { href: "/user_detail", label: "ข้อมูลผู้ใช้งาน", description: "", icon: "bx:user", role: ["USER", "ADMIN", "SUPER_ADMIN"] },
  // { href: "/contact", label: "ติดต่อ", icon: "" },
];

export default function Nav() {
  const pathname = usePathname() || "/";
  const [expandedNavigation, setExpandedNavigation] = useState<{
    pathname: string;
    hrefs: string[];
  }>({ pathname, hrefs: [] });
  const openItems =
    expandedNavigation.pathname === pathname ? expandedNavigation.hrefs : [];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const approve = useDocumentStore((state) => state.approveDocuments)
  const process = useDocumentStore((state) => state.processDocuments)
  const allDocuments = useDocumentStore((state) => state.documents);
  const finish = allDocuments.filter((doc) => doc.workflowInstance?.workflowDefinitionVersion?.workflowStep?.some((step) => step.type === "FINISHER") && doc.status === "PROCESSING");
  const actionDocumentCount = new Set([
    ...approve.map((doc) => doc.documentNo),
    ...process.map((doc) => doc.documentNo),
  ]).size;
  const userRole = useAuthStore((state) => state.user?.user_info.role);

  function toggleItem(href: string) {
    setExpandedNavigation((current) => {
      const currentItems = current.pathname === pathname ? current.hrefs : [];
      return {
        pathname,
        hrefs: currentItems.includes(href)
          ? currentItems.filter((item) => item !== href)
          : [...currentItems, href],
      };
    });
  }

  function closeExpandedMenus(destination: string, closeMobileMenu: boolean) {
    setExpandedNavigation({ pathname: destination, hrefs: [] });
    if (closeMobileMenu) setIsMobileMenuOpen(false);
  }

  function isItemActive(item: NavItem) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`) ||
      item.children?.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`));
  }

  function renderNavigationItem(item: NavItem, closeOnNavigate: boolean) {
      const isActive = isItemActive(item);
      const count =
        item.href === "/approve"
          ? approve.length
          : item.href === "/process"
            ? process.length
            : item.href === "/complete"
            ? finish.length
            : 0;
      const showCountBadge =
        !isActive &&
        (item.href === "/approve" || item.href === "/process" || item.href === "/complete") &&
        count > 0;
      const parentCount = item.href === "/action" ? actionDocumentCount : 0;
      const isOpen = openItems.includes(item.href) || Boolean(
        item.children?.some(
          (child) =>
            pathname === child.href || pathname.startsWith(`${child.href}/`),
        ),
      );

      if (item.children) {
        return (
          <div key={item.href}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggleItem(item.href)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-md font-medium ${
                isActive
                  ? "bg-[#a8a8a8] text-black"
                  : "text-[#c0c0c0] hover:bg-[#a8a8a8] hover:text-black"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon icon={item.icon} />
                <span className="min-w-0 text-left">
                  <span className="block">{item.label}</span>
                  {item.description && (
                    <span className={`mt-0.5 block text-xs font-normal leading-4 `}>
                      {item.description}
                    </span>
                  )}
                </span>
              </span>
              <span className="ml-auto flex shrink-0 items-center gap-2">
                {parentCount > 0 && (
                  <span
                    aria-label={`${parentCount} เอกสารที่ต้องดำเนินการ`}
                    className="min-w-6 rounded-full bg-red-500 px-2 py-0.5 text-center text-xs font-semibold text-white"
                  >
                    {parentCount}
                  </span>
                )}
                <Icon
                  icon="mdi:chevron-down"
                  className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-[#555] pl-2">
                  {item.children.map((child) => {
                    const isChildActive =
                      pathname === child.href ||
                      pathname.startsWith(`${child.href}/`);
                    const childCount =
                      child.href === "/approve"
                        ? approve.length
                        : child.href === "/process"
                          ? process.length
                          : child.href === "/complete"
                          ? finish.length
                          : null;
                    const childCountLabel =
                      child.href === "/approve"
                        ? "เอกสารรออนุมัติ"
                        : child.href === "/complete"
                          ? "เอกสารที่รอปิดจบ"
                          : "เอกสารที่ต้องดำเนินการ";

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() =>
                          closeExpandedMenus(child.href, closeOnNavigate)
                        }
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                          isChildActive
                            ? "bg-[#a8a8a8] text-black"
                            : "text-[#c0c0c0] hover:bg-[#a8a8a8] hover:text-black"
                        }`}
                      >
                        <Icon icon={child.icon} />
                        <span className="min-w-0">
                          <span className="block">{child.label}</span>
                          {child.description && (
                            <span className={`mt-0.5 block text-xs leading-4`}>
                              {child.description}
                            </span>
                          )}
                        </span>
                        {childCount !== null && childCount > 0 && (
                          <span
                            aria-label={`${childCount} ${childCountLabel}`}
                            className={`ml-auto min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-semibold ${"bg-red-500 text-white"
                            }`}
                          >
                            {childCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => closeExpandedMenus(item.href, closeOnNavigate)}
          className={`flex items-center justify-between rounded-md px-3 py-2 text-md font-medium ${
            isActive
              ? "bg-[#a8a8a8] text-black"
              : "text-[#c0c0c0] hover:bg-[#a8a8a8] hover:text-black"
          }`}
        >
          <span className="flex items-center gap-2">
            <Icon icon={item.icon} />
            <span className="min-w-0 text-left">
              <span className="block">{item.label}</span>
              {item.description && (
                <span
                  className={`mt-0.5 block text-xs font-normal leading-4`}
                >
                  {item.description}
                </span>
              )}
            </span>
          </span>
          <span className="flex min-w-[1.5rem] justify-end">
            {isActive ? (
              <Icon icon="weui:arrow-filled" />
            ) : showCountBadge ? (
              <span className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                {count}
              </span>
            ) : null}
          </span>
        </Link>
      );
  }

  function renderNavigationItems(closeOnNavigate = false) {
    const visibleItems = navItems.filter(
      (item) => !item.role || Boolean(userRole && item.role.includes(userRole)),
    );
    const adminItems = visibleItems.filter(
      (item) => item.role?.length === 1 && item.role[0] === "ADMIN",
    );
    const mainItems = visibleItems.filter((item) => !adminItems.includes(item));

    return (
      <>
        {mainItems.map((item) => renderNavigationItem(item, closeOnNavigate))}
        {adminItems.length > 0 && (
          <section className="mt-3 rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-2">
            <div className="mb-2 border-b border-white/10 px-2 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-300">
                พื้นที่ผู้ดูแลระบบ
              </p>
              <p className="mt-1 text-xs leading-4 text-[#a5a5a5]">
                จัดการแบบฟอร์มและข้อมูลระบบ
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {adminItems.map((item) => renderNavigationItem(item, closeOnNavigate))}
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-30 flex w-full items-center justify-between bg-[#1b1b1b] px-4 py-3 text-white shadow-sm md:hidden">
        <div className="flex items-center gap-2 font-semibold">
          <span className="rounded-lg bg-[#4a4df1] p-2">
            <Icon icon="carbon:document" className="text-lg" />
          </span>
          <span className="text-xl">Docflow</span>
        </div>
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex size-10 items-center justify-center rounded-md text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Icon icon="mdi:menu" className="text-2xl" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsMobileMenuOpen(false);
            }}
            className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col justify-between bg-[#1b1b1b] px-5 py-6 shadow-xl"
          >
            <div className="min-h-0 overflow-y-auto scrollbar-none">
              <div className="mb-6 flex items-center justify-between font-semibold">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#4a4df1] p-2">
                    <Icon icon="carbon:document" className="text-lg text-white" />
                  </span>
                  <span className="text-2xl text-white">Docflow</span>
                </div>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex size-10 items-center justify-center rounded-md text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Icon icon="mdi:close" className="text-2xl" />
                </button>
              </div>
              <nav aria-label="Main navigation" className="flex flex-col gap-2">
                {renderNavigationItems(true)}
              </nav>
            </div>
            <div className="mt-6 border-t border-[#555] pt-4">
              <UserNav />
            </div>
          </aside>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen min-h-0 shrink-0 border-r border-slate-200 bg-[#1b1b1b] shadow-sm md:flex md:w-[300px] md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col px-5 py-6">
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none">
            <div className="mb-6 flex items-center gap-2 font-semibold">
              <div className="rounded-lg bg-[#4a4df1] p-2">
                <Icon icon="carbon:document" className="text-lg text-[#ffffff]" />
              </div>
              <span className="text-2xl text-white">{"Docflow"}</span>
            </div>
            <nav aria-label="Main navigation" className="flex flex-col gap-2">
              {renderNavigationItems()}
            </nav>
          </div>
          <div className="mt-6 shrink-0 border-t border-[#555] pt-4">
            <UserNav />
          </div>
        </div>
      </aside>
    </>
  );
}
