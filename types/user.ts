type User = {
    user_name: string;
    user_info_id: string;
    signature: string | null;
    id: string;
    user_info: {
        id: string;
        entra_id: string | null;
        employee_code: string;
        title: "MR" | "MS" | "MRS";
        firstName: string;
        lastName: string;
        firstNameEn: string;
        lastNameEn: string;
        email: string | null;
        role: "USER" | "ADMIN" | "SUPER_ADMIN";
        status: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        positionId: string;
    };
}