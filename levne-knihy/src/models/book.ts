type BookState =
    | "Nový"
    | "Velmi dobrý"
    | "Dobrý"
    | "Uspokojivý";

export interface Book {
    _id: string;
    name: string;
    author: string;
    isbn: string;
    description: string;
    pages: number;
    state: BookState;
    price: number;
    delivery: number;
    uname: string;
}
