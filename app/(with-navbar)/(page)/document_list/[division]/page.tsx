"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useFormStore } from "@/store/form.store";
import { useEffect } from "react";
import { useGetForms } from "@/hooks/set-form";

export default function Page({ params }: { params: { division: string } }) {
    const { division } = params;
    const formMutation = useGetForms();
    const forms = useFormStore((state) => state.forms);
    const currentDivision = forms.find((item) => item.division_code === division);


    useEffect(() => {
        if(forms.length === 0) {
            // Fetch forms if not already fetched
            formMutation.mutate();
        }
    }, [forms]);
    return (
        <div className="bg-slate-50 min-h-screen h-full w-full p-6">
            <div className='flex items-center gap-4'>
                <Link href={'/document_list'} accessKey="it01">
                    <div className='text-white p-2 bg-[#1b1b1b] rounded-md flex justify-between items-center gap-1'>
                        <span className='text-lg'><ArrowLeft /></span>
                    </div>
                </Link>
                <div className="">
                    <h1 className="text-2xl font-bold">{currentDivision ? currentDivision.division_name : "รายการเอกสาร"}</h1>
                    <span>{"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."}</span>
                </div>
            </div>
            {currentDivision && currentDivision.forms.map((form, index: number) => (
                <Link href={`/document_list/${division}/form?schema_id=${form.code}&mode=create`} key={index}>
                    <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full hover:bg-[#e6e6e6] cursor-pointer">
                        <h4>{form.name ? form.name : "ไม่มีชื่อเอกสาร"}</h4>
                    </div>
                </Link>
            ))}
        </div>
    )
}