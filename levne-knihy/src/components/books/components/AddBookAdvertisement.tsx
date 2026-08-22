import useAddBookAdvertisement from "../hooks/useAddBookAdvertisement.ts";
import BookForm from "./BookForm.tsx";

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
        <div id="add-item">

            {!user ? (

                <h4>
                    Do této sekce mohou přispívat pouze
                    přihlášení uživatelé.
                </h4>

            ) : (

                <div className="logged-in">

                    <h2>Přidat inzerát</h2>

                    <BookForm
                        book={newBook}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        submitText="Uložit knihu"
                        showImage={true}
                        onImageChange={handleImageChange}
                    />

                </div>

            )}

        </div>
    );
}


export default AddBookAdvertisement;