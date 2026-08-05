type User = {
    user_name: string;
    user_info_id: string;
    id: string;
    user_info: {
        id: string;
        entra_id: string | null;
        employee_code: string;
        title: "MR" | "MS" | "MRS";
        firstName: string;
        lastName: string;
        firstNameEn: string | null;
        lastNameEn: string | null;
        email: string | null;
        role: "USER" | "ADMIN" | "APPROVER";
        status: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        positionId: string;
    };
}