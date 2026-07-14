import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Page() {
    return (
        <div className="bg-slate-50 min-h-screen h-full w-full p-6">
            <div className='flex items-center gap-4'>
                <Link href={'/document_list'} accessKey="it01">
                    <div className='text-white p-2 bg-[#1b1b1b] rounded-md flex justify-between items-center gap-1'>
                        <span className='text-lg'><ArrowLeft/></span>
                    </div>
                </Link>
                <div className="">
                    <h1 className="text-2xl font-bold">{"รายการเอกสารฝ่าย IT"}</h1>
                    <span>{"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."}</span>
                </div>
            </div>
            <Link href={"/document_list/it/form?schema_id=it_003&mode=create"} accessKey="it02">
                <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full hover:bg-[#e6e6e6] cursor-pointer">
                    <h4>{"แบบฟอร์มเบิกทรัพย์สิน"}</h4>
                </div>
            </Link>
            <Link href={'/document_list/it/form?schema_id=it_001&mode=create'} accessKey="it03">
                <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full hover:bg-[#e6e6e6] cursor-pointer">
                    <h4>{"แบบฟอร์มร้องขอดำเนินการด้าน IT"}</h4>
                </div>
            </Link>
            <Link href={'/document_list/it/form?schema_id=it_002&mode=create'} accessKey="it04">
                <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full hover:bg-[#e6e6e6] cursor-pointer">
                    <h4>{"แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์"}</h4>
                </div>
            </Link>
        </div>
    )
}