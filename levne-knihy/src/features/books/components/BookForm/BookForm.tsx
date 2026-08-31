import "./BookForm.css";

import { BookFormProps, BookState } from "../../types";

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
        <form onSubmit={onSubmit} className="book-form">

            <div className="form-field">
                <label htmlFor="name">Název</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={book.name}
                    required
                    onChange={onChange}
                    placeholder="Např. Malý princ"
                />
            </div>

            <div className="form-field">
                <label htmlFor="author">Autor</label>
                <input
                    type="text"
                    id="author"
                    name="author"
                    value={book.author}
                    required
                    onChange={onChange}
                    placeholder="Např. Antoine de Saint-Exupéry"
                />
            </div>

            <div className="form-field">
                <label htmlFor="description">Popis</label>
                <textarea
                    id="description"
                    name="description"
                    value={book.description}
                    onChange={onChange}
                    placeholder="Krátký popis stavu a obsahu knihy..."
                    rows={4}
                />
            </div>

            <div className="form-row form-row-2">
                <div className="form-field">
                    <label htmlFor="pages">Počet stránek</label>
                    <input
                        type="number"
                        id="pages"
                        name="pages"
                        value={book.pages}
                        required
                        onChange={onChange}
                        placeholder="0"
                        min="1"
                    />
                </div>


                {showImage && (
                    <div className="form-field">
                        <label htmlFor="image">Obrázek obálky</label>
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

            </div>


            <div className="form-field">
                <label>Stav knihy</label>
                <div className="book-form__states">
                    {Object.values(BookState).map((state) => (
                        <label
                            className="book-form__state"
                            key={state}
                            htmlFor={`state-${state}`}
                        >
                            <input
                                type="radio"
                                id={`state-${state}`}
                                name="state"
                                value={state}
                                checked={book.state === state}
                                required
                                onChange={onChange}
                            />
                            <span>{state}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-row form-row-2">
                <div className="form-field">
                    <label htmlFor="price">Cena (Kč)</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={book.price}
                        required
                        onChange={onChange}
                        placeholder="0"
                        min="0"
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="delivery">Poštovné (Kč)</label>
                    <input
                        type="number"
                        id="delivery"
                        name="delivery"
                        value={book.delivery}
                        required
                        onChange={onChange}
                        placeholder="0"
                        min="0"
                    />
                </div>
            </div>

            <div className="form-actions">
                <button className="btn" type="submit">
                    {submitText}
                </button>
            </div>
        </form>
    );
}

export default BookForm;
