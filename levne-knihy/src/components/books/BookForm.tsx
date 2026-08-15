import React from "react";

// TODO: lépe definovat typ Book - bude se používat na více místech v kódu
interface Book {
    name: string;
    author: string;
    description: string;
    pages: string | number;
    state: string;
    price: string | number;
    delivery: string | number;
    image?: string;
}

interface BookFormProps {
    book: Book;
    setBook: React.Dispatch<React.SetStateAction<Book>>;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    submitText: string;
    showImage?: boolean;
    onImageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function BookForm({
    book,
    setBook,
    onSubmit,
    submitText,
    showImage = false,
    onImageChange,
}: BookFormProps) {

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setBook({
            ...book,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="logged-in-left">

                <div>
                    <label htmlFor="name">Název:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={book.name}
                        required
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="author">Autor:</label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        value={book.author}
                        required
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="description">Popis:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={book.description}
                        onChange={handleChange}
                    />
                </div>

            </div>

            <div className="logged-in-right">

                <div>
                    <label htmlFor="pages">Počet stránek:</label>
                    <input
                        type="number"
                        id="pages"
                        name="pages"
                        value={book.pages}
                        required
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Stav knihy:</label>

                    <div id="state">

                        <div className="book-state">
                            <input
                                type="radio"
                                id="state-new"
                                name="state"
                                value="nová"
                                checked={book.state === "nová"}
                                required
                                onChange={handleChange}
                            />
                            <label htmlFor="state-new">Nová</label>
                        </div>

                        <div className="book-state">
                            <input
                                type="radio"
                                id="state-excellent"
                                name="state"
                                value="velmi dobrý"
                                checked={book.state === "velmi dobrý"}
                                onChange={handleChange}
                            />
                            <label htmlFor="state-excellent">
                                Velmi dobrý
                            </label>
                        </div>

                        <div className="book-state">
                            <input
                                type="radio"
                                id="state-good"
                                name="state"
                                value="dobrý"
                                checked={book.state === "dobrý"}
                                onChange={handleChange}
                            />
                            <label htmlFor="state-good">Dobrý</label>
                        </div>

                        <div className="book-state">
                            <input
                                type="radio"
                                id="state-poor"
                                name="state"
                                value="horší stav"
                                checked={book.state === "horší stav"}
                                onChange={handleChange}
                            />
                            <label htmlFor="state-poor">
                                Horší stav
                            </label>
                        </div>

                    </div>
                </div>

                <div>
                    <label htmlFor="price">Cena:</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={book.price}
                        required
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="delivery">Poštovné:</label>
                    <input
                        type="number"
                        id="delivery"
                        name="delivery"
                        value={book.delivery}
                        required
                        onChange={handleChange}
                    />
                </div>

                {showImage && (
                    <div>
                        <label htmlFor="image">Obrázek:</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            required
                            onChange={onImageChange}
                        />
                    </div>
                )}

                <button className="btn" type="submit">
                    {submitText}
                </button>

            </div>
        </form>
    );
}

export default BookForm;