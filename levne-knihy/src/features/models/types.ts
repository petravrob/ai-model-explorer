export enum ModelState {
    NEW = "Nový",
    VERY_GOOD = "Velmi dobrý",
    GOOD = "Dobrý",
    SATISFACTORY = "Uspokojivý",
}

export interface AIModel {
    _id: string;
    name: string;
    author: string;
    description: string;
    pages: number;
    state: ModelState;
    price: number;
    delivery: number;
    image: string;
    fname: string;
    lname: string;
    phone: string;
    uname: string;
}
export interface ModelListProps {
    models: AIModel[];
    onModelClick: (model: AIModel) => void;
}
