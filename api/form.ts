import { api } from "@/lib/axios";
import { toast } from "react-toastify";

export async function getAllForm() {
    const response = await api.get('/form/all');
    if (response.status === 200) {
        // toast.success("ดึงรายการเอกสารสำเร็จ");
    } else {
        toast.error("ไม่สามารถดึงรายการเอกสารได้");
    }
    return response.data;
} 

export async function getFormFields(schema_id: string) {
    const response = await api.get(`/form/${schema_id}`);
    if (response.status === 200) {
        // toast.success("ดึงฟิลด์เอกสารสำเร็จ");
    } else {
        toast.error("ไม่สามารถดึงฟิลด์เอกสารได้");
    }
    return response.data;
}

export async function getFormDetail(schema_id: string) {
    const response = await api.get(`form/form_detail/${schema_id}`)
    if (response.status === 200) {
        // toast.success("ดึงข้อมูลเอกสารสำเร็จ")
    } else {
        toast.error("ไม่สามารถดึงข้อมูลเอกสารได้")
    }
    return response.data;
}