import "./BookForm.css";

import { BookFormProps, BookState } from "../../types";
import { Button, Form, FormActions, FormField } from "../../../../ui";

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
        <Form onSubmit={onSubmit}>

            <FormField label="Název" htmlFor="name">
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={book.name}
                    required
                    onChange={onChange}
                    placeholder="Např. Malý princ"
                />
            </FormField>

            <FormField label="Autor" htmlFor="author">
                <input
                    type="text"
                    id="author"
                    name="author"
                    value={book.author}
                    required
                    onChange={onChange}
                    placeholder="Např. Antoine de Saint-Exupéry"
                />
            </FormField>

            <FormField label="Popis" htmlFor="description">
                <textarea
                    id="description"
                    name="description"
                    value={book.description}
                    onChange={onChange}
                    placeholder="Krátký popis stavu a obsahu knihy..."
                    rows={4}
                />
            </FormField>

            <div className="form-row form-row-2">
                <FormField label="Počet stránek" htmlFor="pages">
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
                </FormField>

                {showImage && (
                    <FormField label="Obrázek obálky" htmlFor="image">
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            required
                            onChange={onImageChange}
                        />
                    </FormField>
                )}
            </div>

            <FormField label="Stav knihy">
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
            </FormField>

            <div className="form-row form-row-2">
                <FormField label="Cena (Kč)" htmlFor="price">
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
                </FormField>

                <FormField label="Poštovné (Kč)" htmlFor="delivery">
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
                </FormField>
            </div>

            <FormActions>
                <Button type="submit">
                    {submitText}
                </Button>
            </FormActions>
        </Form>
    );
}

export default BookForm;
