"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from '@iconify/react';
import UserNav from "./UserNav";
import { useDocumentStore } from "@/store/document.store";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "material-symbols:dashboard-outline-rounded" },
  {
    href: "/action",
    label: "ดำเนินการเอกสาร",
    icon: "fluent:document-lightning-48-regular",
    children: [
      { href: "/approve", label: "อนุมัติเอกสาร", icon: "carbon:document-set" },
      { href: "/process", label: "ดำเนินการ", icon: "streamline-ultimate:loading-bold" },
    ]
  },
  {
    href: "/document",
    label: "จัดการแบบฟอร์ม",
    icon: "fluent-mdl2:document-set",
    children: [
      { href: "/create", label: "สร้างแบบฟอร์ม", icon: "gridicons:create" },
      { href: "/update_form", label: "แก้ไขแบบฟอร์ม", icon: "material-symbols:edit-document-outline" },
    ],
  },
  { href: "/document_list", label: "รายการเอกสาร", icon: "fluent-mdl2:document-set" },
  { href: "/tracking", label: "ตรวจสอบสถานะ", icon: "iconamoon:search-light" },
  // { href: "/contact", label: "ติดต่อ", icon: "" },
];

export default function Nav() {
  const pathname = usePathname() || "/";
  const [openItems, setOpenItems] = useState<string[]>([]);
  const approve = useDocumentStore((state) => state.approveDocuments)
  const process = useDocumentStore((state) => state.processDocuments)

  function toggleItem(href: string) {
    setOpenItems((current) =>
      current.includes(href)
        ? current.filter((item) => item !== href)
        : [...current, href]
    );
  }

  function isItemActive(item: NavItem) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`) ||
      item.children?.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`));
  }

  return (
    <div className="bg-[#1b1b1b] border-r border-slate-200 shadow-sm md:min-w-1/6  md:w-1/6 sticky top-0 h-screen hidden lg:block">
      <div className="flex h-full flex-col justify-between px-6 py-6 min-h-screen">
        <div>
          <div className="mb-6 font-semibold flex gap-2 items-center">
            <div className="bg-[#4a4df1] rounded-lg p-2">
              <Icon icon="carbon:document" className="text-lg text-[#ffffff]" />
            </div>
            <span className="text-2xl text-white">{"Docflow"}</span>
          </div>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = isItemActive(item);
              const count = item.href === "/approve" ? approve.length : item.href === "/process" ? process.length : 0;
              const showCountBadge = !isActive && (item.href === "/approve" || item.href === "/process") && count > 0;
              const isOpen = openItems.includes(item.href) || Boolean(
                item.children?.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`))
              );

              if (item.children) {
                return (
                  <div key={item.href}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleItem(item.href)}
                      className={`flex w-full justify-between items-center rounded-md px-3 py-2 text-md font-medium transition-colors duration-150 ${isActive
                        ? "bg-[#a8a8a8] text-black"
                        : "text-[#c0c0c0] hover:bg-[#a8a8a8] hover:text-black"
                        }`}
                    >
                      <div className="flex gap-2 items-center">
                        <Icon icon={item.icon} />
                        <span>{item.label}</span>
                      </div>
                      <Icon
                        icon="mdi:chevron-down"
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-[#555] pl-2">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${isChildActive
                                  ? "bg-[#a8a8a8] text-black"
                                  : "text-[#c0c0c0] hover:bg-[#a8a8a8] hover:text-black"
                                  }`}
                              >
                                <Icon icon={child.icon} />
                                <span>{child.label}</span>
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
                  className={`flex justify-between items-center rounded-md px-3 py-2 text-md font-medium transition-colors duration-150 ${isActive
                    ? "bg-[#a8a8a8] text-black"
                    : "text-[#c0c0c0] hover:bg-[#a8a8a8] hover:text-black"
                    }`}
                >
                  <div className="flex gap-2 items-center">
                    <Icon icon={item.icon} />
                    <span>{item.label}</span>
                  </div>
                  <div className="min-w-[1.5rem] flex justify-end">
                    {isActive ? (
                      <Icon icon={"weui:arrow-filled"} />
                    ) : showCountBadge ? (
                      <div className="text-white text-xs bg-red-500 rounded-full px-2 py-1">
                        <span>{count}</span>
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="">
          <UserNav />
        </div>
      </div>
    </div>
  );
}
