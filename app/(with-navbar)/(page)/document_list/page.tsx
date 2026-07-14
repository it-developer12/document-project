'use client'

import Link from "next/link"
import { Icon } from '@iconify/react';

export default function Page() {
    return (
        <div className="bg-slate-50 min-h-screen h-full w-full p-6">
            <div className="flex justify-center mt-10">
                <div className="flex justify-between w-3/4">
                    <Link href={"/document_list/it"} className="w-[20%]">
                        <div className="bg-white border rounded-xl px-5 py-4 shadow flex flex-col items-center gap-2 cursor-pointer hover:bg-[#e6e6e6]">
                            <Icon icon={"fa6-solid:computer"} className="text-[48px]" />
                            <span>{"เอกสารฝ่าย IT"}</span>
                        </div>
                    </Link>
                    <div className="bg-white border rounded-xl px-5 py-4 shadow w-[20%] flex flex-col items-center gap-2 cursor-pointer hover:bg-[#e6e6e6]">
                        <Icon icon={"nimbus:cash"} className="text-[48px]" />
                        <span>{"เอกสารฝ่ายบัญชี"}</span>
                    </div>
                    <div className="bg-white border rounded-xl px-5 py-4 shadow w-[20%] flex flex-col items-center gap-2 cursor-pointer hover:bg-[#e6e6e6]">
                        <Icon icon={"si:wrench-line"} className="text-[48px]" />
                        <span>{"เอกสารฝ่ายซ่อมบำรุง"}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}