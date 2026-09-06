import "./BookDetailPage.css";

import { useParams } from "react-router-dom";

import useBookDetail from "../../hooks/useBookDetail";
import BookDetail from "../BookDetail/BookDetail";
import BookForm from "../BookForm/BookForm";
import { Button, PageContainer, PageMessage, PageTitle } from "@/ui";

/** Stránka s detailem knihy – vlastník si inzerát může upravit nebo smazat. */
function BookDetailPage() {

    const { bookId } = useParams<{
        bookId: string;
    }>();

    const {
        book,
        canManage,
        editing,
        editedBook,

        handleChange,
        handleImageChange,

        handleBack,
        handleEdit,
        handleSubmit,
        handleDelete,

        loading,
        error,
    } = useBookDetail(bookId);


    if (loading) {
        return (
            <PageContainer>
                <PageMessage>Načítání knihy...</PageMessage>
            </PageContainer>
        );
    }

    if (error || !book) {
        return (
            <PageContainer>
                <Button variant="outline" onClick={handleBack}>
                    Zpět na seznam
                </Button>

                <PageMessage>
                    {error ?? "Kniha nebyla nalezena."}
                </PageMessage>
            </PageContainer>
        );
    }

    if (editing) {
        return (
            <PageContainer>
                <PageTitle centered>Upravit inzerát</PageTitle>

                <BookForm
                    book={editedBook}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    submitText="Upravit inzerát"
                    showImage={false}
                    onImageChange={handleImageChange}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Button variant="outline" onClick={handleBack}>
                Zpět na seznam
            </Button>

            <BookDetail book={book} />

            {canManage && (
                <div className="book-detail-page__actions">
                    <Button variant="outline" onClick={handleDelete}>
                        Smazat inzerát
                    </Button>

                    <Button onClick={handleEdit}>
                        Upravit inzerát
                    </Button>
                </div>
            )}
        </PageContainer>
    );
}

export default BookDetailPage;
