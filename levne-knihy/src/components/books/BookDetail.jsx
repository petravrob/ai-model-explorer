import "../../App.css"

function BookDetail ({selectedBook}) {
    console.log(selectedBook);

    const handleClick = () => {
        selectedBook = "";
    }
    return (
        <div>

        <div className="book-detail">
        <div className="book-container">
            <h2 className="book-name">{selectedBook.name}</h2>
            <h4 className="book-author">{selectedBook.author}</h4>
            <img className="book-image" src={selectedBook.image} />
          
        </div>
        <div className="book-container">
            <p className="book-detail-text">Popis: <br/>{selectedBook.description}</p>
            <p className="book-detail-text">Stav knihy: <b>{selectedBook.state}</b></p>
            <p className="book-detail-text">Počet stránek: <b>{selectedBook.pages}</b></p>
            <p className="book-detail-text">Cena: <b>{selectedBook.price} Kč,-</b></p>
            <p className="book-detail-text">Poštovné: <b>{selectedBook.delivery} Kč,-</b></p> 
             <p className="book-detail-text">Prodávající: <b>{selectedBook.fname + " " + selectedBook.lname}</b></p>
            <p className="book-detail-text">Telefon: <b>{selectedBook.phone}</b></p>
        </div>
    </div>
    <button className="btn" onClick={handleClick()}>Zpět k prohlížení</button>

    </div>
    )
}

export default BookDetail;