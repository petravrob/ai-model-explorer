import useAddBookAdvertisement from "../../hooks/useAddBookAdvertisement";
import BookForm from "../BookForm/BookForm";
import { PageContainer, PageTitle } from "@/ui";

/** Rozhraní pro přidání nové knihy. Stránka je dostupná pouze přihlášeným. */
function AddBookAdvertisement() {

    const {
        newBook,
        handleChange,
        handleImageChange,
        handleSubmit,
    } = useAddBookAdvertisement();


    return (
        <PageContainer>
            <PageTitle centered>Přidat inzerát</PageTitle>

            <BookForm
                book={newBook}
                onChange={handleChange}
                onSubmit={handleSubmit}
                submitText="Uložit knihu"
                showImage={true}
                onImageChange={handleImageChange}
            />
        </PageContainer>
    );
}

export default AddBookAdvertisement;

