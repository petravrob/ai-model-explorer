export interface Book {
    _id: string;
    name: string;
    author: string;
    description: string;
    pages: number;
    state: string;
    price: number;
    delivery: number;
    image: string;
    fname: string;
    lname: string;
    phone: string;
    uname: string;
}
export interface BookListProps {
    books: Book[];
    onBookClick: (book: Book) => void;
}
export interface BookFormData {
    name: string;
    author: string;
    description: string;
    pages: number | "";
    state: string;
    price: number | "";
    delivery: number | "";
    image: string;
}
export interface BookFormProps {
    book: BookFormData;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    submitText: string;
    showImage?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface BookBrowserProps {
    mode: BookBrowserMode;
}

export type BookBrowserMode = "all" | "user";
