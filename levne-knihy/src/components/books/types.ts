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
    pages: string;
    state: string;
    price: string;
    delivery: string;
    image: string;
}

export interface BookFormProps {
    book: BookFormData;
    setBook: React.Dispatch<React.SetStateAction<BookFormData>>;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    submitText: string;
    showImage?: boolean;
    onImageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}