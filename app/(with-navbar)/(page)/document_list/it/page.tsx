"use client"
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FormSchema from "@/SampleData/form.json"

export default function Page() {
    console.log(FormSchema)
    const filtered = FormSchema.form.filter((form) => form.department === "it")
    console.log(filtered)
    return (
        <div className="bg-slate-50 min-h-screen h-full w-full p-6">
            <div className='flex items-center gap-4'>
                <Link href={'/document_list'} accessKey="it01">
                    <div className='text-white p-2 bg-[#1b1b1b] rounded-md flex justify-between items-center gap-1'>
                        <span className='text-lg'><ArrowLeft /></span>
                    </div>
                </Link>
                <div className="">
                    <h1 className="text-2xl font-bold">{"รายการเอกสารฝ่าย IT"}</h1>
                    <span>{"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."}</span>
                </div>
            </div>
            {filtered.map((form: any, index: number) => 
                (
                    <Link href={`/document_list/it/form?schema_id=${form.schema_id}&mode=create`} accessKey="it02">
                        <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full hover:bg-[#e6e6e6] cursor-pointer">
                            <h4>{form.name}</h4>
                        </div>
                    </Link>
                )
            )}
        </div>
    )
}