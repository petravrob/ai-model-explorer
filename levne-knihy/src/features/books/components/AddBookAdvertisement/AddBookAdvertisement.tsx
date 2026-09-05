import useAddBookAdvertisement from "../../hooks/useAddBookAdvertisement.ts";
import BookForm from "../BookForm/BookForm.tsx";
import { PageContainer, PageMessage, PageTitle } from "@/ui";

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
        <PageContainer>
            {!user ? (
                <PageMessage>
                    Do této sekce mohou přispívat pouze přihlášení uživatelé.
                </PageMessage>
            ) : (
                <>
                    <PageTitle centered>Přidat inzerát</PageTitle>

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
        </PageContainer>
    );
}

export default AddBookAdvertisement;
