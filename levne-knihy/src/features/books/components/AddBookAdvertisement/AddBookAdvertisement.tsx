import useAddBookAdvertisement from "../../hooks/useAddBookAdvertisement.ts";
import BookForm from "../BookForm/BookForm.tsx";
import "./AddBookAdvertisement.css";

/** Rozhraní pro přidání nové knihy. */
function AddBookAdvertisement() {

    const {
        user,
        newBook,
        handleChange,
        handleImageChange,
        handleSubmit,
    } = useAddBookAdvertisement();


    return (
        <div className="add-book">

            {!user ? (
                <p className="add-book__message">
                    Do této sekce mohou přispívat pouze přihlášení uživatelé.
                </p>
            ) : (
                <>
                    <h2>Přidat inzerát</h2>

                    <BookForm
                        book={newBook}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        submitText="Uložit knihu"
                        showImage={true}
                        onImageChange={handleImageChange}
                    />
                </>
            )}
        </div>
    );
}

export default AddBookAdvertisement;
