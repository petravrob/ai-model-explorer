import React from "react";
import { BookFormProps } from "../types";

/** Zobrazuje formulář pro vytvoření nebo úpravu inzerátu knihy */
function BookForm({
    book,
    onChange,
    onSubmit,
    submitText,
    showImage = true,
    onImageChange,
}: BookFormProps) {

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
                        onChange={onChange}
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
                        onChange={onChange}
                    />
                </div>

                <div>
                    <label htmlFor="description">Popis:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={book.description}
                        onChange={onChange}
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
                        onChange={onChange}
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
                                onChange={onChange}
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
                                onChange={onChange}
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
                                onChange={onChange}
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
                                onChange={onChange}
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
                        onChange={onChange}
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
                        onChange={onChange}
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