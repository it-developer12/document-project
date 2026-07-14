"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from '@iconify/react';

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "material-symbols:dashboard-outline-rounded" },
  { href: "/approve", label: "อนุมัติเอกสาร", icon: "carbon:document-set" },
  { href: "/create", label: "สร้างเอกสาร", icon: "gridicons:create" },
  { href: "/document_list", label: "คลังเอกสาร", icon: "fluent-mdl2:document-set" },
  { href: "/process", label: "ดำเนินการ", icon: "streamline-ultimate:loading-bold" },
  { href: "/tracking", label: "ตรวจสอบสถานะ", icon: "iconamoon:search-light" },
  // { href: "/contact", label: "ติดต่อ", icon: "" },
];

export default function Nav() {
  const pathname = usePathname() || "/";

  return (
    <div className="bg-[#1b1b1b] border-r border-slate-200 shadow-sm  md:w-1/5 sticky top-0 h-screen hidden lg:block">
      <div className="flex h-full flex-col px-6 py-6">
        <div className="mb-6 font-semibold flex gap-2 items-center">
          <div className="bg-[#4a4df1] rounded-lg p-2">
            <Icon icon="carbon:document" className="text-lg text-[#ffffff]" />
          </div>
          <span className="text-2xl text-white">{"Docflow"}</span>
        </div>
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = "/" + pathname.split('/')[1] === item.href;
            const path = "/" + pathname.split('/')[1];
            return (
              item.href === "/approve" || item.href === "/process" ?
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex justify-between items-center rounded-md px-3 py-2 text-md font-medium transition-colors duration-150 ${isActive
                    ? "bg-[#a8a8a8] text-"
                    : "text-[#c0c0c0] hover:bg-[#a8a8a8] hover:text-black"
                    }`}
                >
                  <div className="flex gap-2 items-center">
                    <Icon icon={item.icon} />
                    <span>{item.label}</span>
                  </div>
                  <div className={``}>
                    {isActive && (item.href === "/approve" || item.href === "/process")  ? (
                      <Icon icon={"weui:arrow-filled"} />
                    ) : (
                      <div className="text-white text-xs bg-red-500 rounded-full px-2 py-1">
                        <span>{2}</span>
                      </div>
                    )}
                  </div>
                </Link>
                :
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex justify-between items-center rounded-md px-3 py-2 text-md font-medium transition-colors duration-150 ${isActive
                    ? "bg-[#a8a8a8]"
                    : "text-[#c0c0c0] hover:bg-[#a8a8a8] hover:text-black"
                    }`}
                >
                  <div className="flex gap-2 items-center">
                    <Icon icon={item.icon} />
                    <span>{item.label}</span>
                  </div>
                  <div className={`${isActive ? '' : 'hidden'}`}>
                    <Icon icon={"weui:arrow-filled"} />
                  </div>
                </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
