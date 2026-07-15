'use client'
import { Icon } from '@iconify/react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';

export default function Page() {
    const router = useRouter();
    
        function changePage(route:string) {
            router.push(route)
        }
    return (
        <div className="bg-slate-50 min-h-screen h-full w-full p-6">
            <div className='flex items-center gap-4'>
                <Link href={'/dashboard'}>
                    <div className='text-white p-2 bg-[#1b1b1b] rounded-md flex justify-between items-center gap-1'>
                        <Icon icon={"tabler:arrow-left"} className='text-lg' />
                    </div>
                </Link>
                <div className="">
                    <h1 className="text-2xl font-bold">{"ยกเลิกหรือตีกลับเอกสาร"}</h1>
                    <span>{"กรณียกเลิกหรือตีกลับเอกสารกรุณาใส่เหตุผลด้านล่าง"}</span>
                </div>
            </div>
            <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full space-y-1">
                <span className="text-lg font-bold">{"เหตุผลในการยกเลิกหรือตีกลับเอกสาร "}</span>
                <span className="text-red-400">{"*"}</span>
                <textarea className="w-full p-1.5 pl-2 py-2 border rounded bg-[#F3F4F8] text-md" rows={5} placeholder="มาตรฐาน หรือ Spec ที่ต้องการ"></textarea>
                <div className="mt-4">
                    <div className="flex gap-4 justify-end">
                        <button className="text-white bg-red-500 px-4 py-2 rounded-md hover:cursor-pointer" onClick={() => changePage("/view/it/form_2?doc_id=DOC-IT-0002")}>{"ยกเลิก"}</button>
                        <button className="text-white bg-[#4A4DF1] px-4 py-2 rounded-md hover:cursor-pointer" onClick={() => {
                            toast.warning("เพิ่มเหตุผลสำหรับโต้กลับหรือยกเลิกเอกสารเรียบร้อย")
                            changePage("/dashboard")
                        }}>{"บันทึก"}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}