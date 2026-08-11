'use client'

import Link from "next/link"
import { Icon } from '@iconify/react';
import { useGetForms } from "@/hooks/set-form";
import { useFormStore } from "@/store/form.store";
import { useEffect } from "react";

export default function Page() {
    const formMutation = useGetForms();
    const forms = useFormStore((state) => state.forms);

    useEffect(() => {
        formMutation.mutate();
    }, [forms]);
    return (
        <div className="bg-slate-50 min-h-screen h-full w-full p-6">
            <div className="flex justify-center mt-10">
                <div className="flex justify-between w-3/4">
                
                    {forms.map((item, index) => (
                        <Link href={`/document_list/${item.division_code}`} key={index} className="w-[20%]">
                            <div className="bg-white border rounded-xl px-5 py-4 shadow flex flex-col items-center gap-2 cursor-pointer hover:bg-[#e6e6e6]">
                                <Icon icon={"fa6-solid:computer"} className="text-[48px]" />
                                <span>{item.division_name}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}