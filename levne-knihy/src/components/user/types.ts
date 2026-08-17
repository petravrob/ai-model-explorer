export interface User {
    _id: string;
    uname: string;
    fname: string;
    lname: string;
    phone: string;
    email: string;
}


export interface UserFormData {
    uname?: string;
    fname: string;
    lname: string;
    phone: string;
    email: string;
    password?: string;
}


export interface LoginData {
    uname: string;
    password: string;
}


export interface UserDetailsProps {
    user: User;
    onEdit: () => void;
}


export interface UserFormProps {
    title: string;

    formData: UserFormData;

    handleChange: (
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;

    handleSubmit: (
        e: React.FormEvent<HTMLFormElement>
    ) => void;

    submitText: string;

    showUsername?: boolean;
    showPassword?: boolean;
}
