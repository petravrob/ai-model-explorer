const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("./models/User.js");
require("./models/Book.js");
require("dotenv").config();


const User = mongoose.model("User");
const Book = mongoose.model("Book");

// mongodb connection
const mongoUrl = process.env.MONGO_URI;


// #region USERS

const users = [
    {
        uname: "petra",
        fname: "Petra",
        lname: "Nováková",
        email: "petra.novakova@example.cz",
        phone: "777111222",
        password: "test123"
    },
    {
        uname: "jan",
        fname: "Jan",
        lname: "Novotný",
        email: "jan.novotny@example.cz",
        phone: "777222333",
        password: "test123"
    },
    {
        uname: "lucie",
        fname: "Lucie",
        lname: "Svobodová",
        email: "lucie.svobodova@example.cz",
        phone: "777333444",
        password: "test123"
    },
    {
        uname: "martin",
        fname: "Martin",
        lname: "Dvořák",
        email: "martin.dvorak@example.cz",
        phone: "777444555",
        password: "test123"
    },
    {
        uname: "anna",
        fname: "Anna",
        lname: "Procházková",
        email: "anna.prochazkova@example.cz",
        phone: "777555666",
        password: "test123"
    },
    {
        uname: "tomas",
        fname: "Tomáš",
        lname: "Černý",
        email: "tomas.cerny@example.cz",
        phone: "777666777",
        password: "test123"
    },
    {
        uname: "katerina",
        fname: "Kateřina",
        lname: "Veselá",
        email: "katerina.vesela@example.cz",
        phone: "777777888",
        password: "test123"
    },
    {
        uname: "ondrej",
        fname: "Ondřej",
        lname: "Král",
        email: "ondrej.kral@example.cz",
        phone: "777888999",
        password: "test123"
    },
    {
        uname: "tereza",
        fname: "Tereza",
        lname: "Horáková",
        email: "tereza.horakova@example.cz",
        phone: "778111222",
        password: "test123"
    },
    {
        uname: "michal",
        fname: "Michal",
        lname: "Beneš",
        email: "michal.benes@example.cz",
        phone: "778222333",
        password: "test123"
    },
    {
        uname: "veronika",
        fname: "Veronika",
        lname: "Fialová",
        email: "veronika.fialova@example.cz",
        phone: "778333444",
        password: "test123"
    },
    {
        uname: "david",
        fname: "David",
        lname: "Pokorný",
        email: "david.pokorny@example.cz",
        phone: "778444555",
        password: "test123"
    },
    {
        uname: "nikola",
        fname: "Nikola",
        lname: "Marková",
        email: "nikola.markova@example.cz",
        phone: "778555666",
        password: "test123"
    },
    {
        uname: "filip",
        fname: "Filip",
        lname: "Urban",
        email: "filip.urban@example.cz",
        phone: "778666777",
        password: "test123"
    },
    {
        uname: "barbora",
        fname: "Barbora",
        lname: "Malá",
        email: "barbora.mala@example.cz",
        phone: "778777888",
        password: "test123"
    }
];

// #endregion

// #region oprav
// ======================================================
// PLACEHOLDER IMAGE
// ======================================================

// #region
// Knihy dostanou jednoduchý placeholder obrázek.
// Později ho můžeš nahradit skutečnými obrázky.
function createPlaceholder(title) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
            <rect width="400" height="600" fill="#eeeeee"/>
            <text x="200" y="280"
                  text-anchor="middle"
                  font-family="Arial"
                  font-size="24"
                  fill="#555555">
                ${title}
            </text>
            <text x="200" y="320"
                  text-anchor="middle"
                  font-family="Arial"
                  font-size="18"
                  fill="#888888">
                Levné knihy
            </text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}


// #region BOOKS
const books = [

    {
        name: "Malý princ",
        author: "Antoine de Saint-Exupéry",
        isbn: "9780156012195",
        description: "Klasický příběh o přátelství, lásce, odpovědnosti a smyslu života.",
        pages: 96,
        state: "Velmi dobrý",
        price: 100,
        delivery: 55,
        uname: "tomas"
    },

    {
        name: "1984",
        author: "George Orwell",
        isbn: "9780141185064",
        description: "Dystopický román o totalitní společnosti, všudypřítomném dohledu a manipulaci.",
        pages: 328,
        state: "Dobrý",
        price: 160,
        delivery: 60,
        uname: "katerina"
    },

    {
        name: "Farma zvířat",
        author: "George Orwell",
        isbn: "9780141036137",
        description: "Satirická alegorie o moci, politice a zneužití ideálů.",
        pages: 120,
        state: "Velmi dobrý",
        price: 110,
        delivery: 55,
        uname: "ondrej"
    },

    {
        name: "Harry Potter a Kámen mudrců",
        author: "J. K. Rowlingová",
        isbn: "9781408855652",
        description: "První díl dobrodružství Harryho Pottera na škole čar a kouzel v Bradavicích.",
        pages: 288,
        state: "Dobrý",
        price: 220,
        delivery: 65,
        uname: "tereza"
    },

    {
        name: "Harry Potter a Tajemná komnata",
        author: "J. K. Rowlingová",
        isbn: "9781408855669",
        description: "Druhý díl série o Harrym Potterovi a tajemství ukrytém v Bradavicích.",
        pages: 304,
        state: "Velmi dobrý",
        price: 230,
        delivery: 65,
        uname: "michal"
    },

    {
        name: "Harry Potter a vězeň z Azkabanu",
        author: "J. K. Rowlingová",
        isbn: "9781408855676",
        description: "Harry se ve třetím díle dozvídá více o minulosti svých rodičů.",
        pages: 384,
        state: "Dobrý",
        price: 240,
        delivery: 65,
        uname: "veronika"
    },

    {
        name: "Pán prstenů: Společenstvo Prstenu",
        author: "J. R. R. Tolkien",
        isbn: "9780261103573",
        description: "První část slavné fantasy trilogie o cestě Froda Pytlíka.",
        pages: 432,
        state: "Dobrý",
        price: 250,
        delivery: 70,
        uname: "david"
    },

    {
        name: "Pýcha a předsudek",
        author: "Jane Austenová",
        isbn: "9780141439518",
        description: "Klasický román o lásce, společenských poměrech a prvních dojmech.",
        pages: 432,
        state: "Dobrý",
        price: 170,
        delivery: 60,
        uname: "filip"
    },

    {
        name: "Velký Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "9780743273565",
        description: "Příběh lásky, bohatství a amerického snu v prostředí New Yorku.",
        pages: 180,
        state: "Velmi dobrý",
        price: 130,
        delivery: 55,
        uname: "barbora"
    },

    {
        name: "Alchymista",
        author: "Paulo Coelho",
        isbn: "9780061122415",
        description: "Příběh mladého pastýře, který se vydává hledat svůj osobní poklad.",
        pages: 208,
        state: "Dobrý",
        price: 120,
        delivery: 55,
        uname: "petra"
    },

    {
        name: "Sto roků samoty",
        author: "Gabriel García Márquez",
        isbn: "9780060883287",
        description: "Magickorealistický román o několika generacích rodiny Buendíů.",
        pages: 408,
        state: "Velmi dobrý",
        price: 190,
        delivery: 65,
        uname: "jan"
    },

    {
        name: "Mistr a Markétka",
        author: "Michail Bulgakov",
        isbn: "9780679760801",
        description: "Výrazný román kombinující satiru, fantastické prvky a milostný příběh.",
        pages: 416,
        state: "Dobrý",
        price: 180,
        delivery: 65,
        uname: "lucie"
    },

    {
        name: "Zločin a trest",
        author: "Fjodor Michajlovič Dostojevskij",
        isbn: "9780140449136",
        description: "Psychologický román o vině, svědomí a následcích zločinu.",
        pages: 560,
        state: "Dobrý",
        price: 220,
        delivery: 75,
        uname: "martin"
    },

    {
        name: "Anna Karenina",
        author: "Lev Nikolajevič Tolstoj",
        isbn: "9780143035008",
        description: "Klasický román o lásce, společnosti, rodině a osobní svobodě.",
        pages: 864,
        state: "Dobrý",
        price: 250,
        delivery: 80,
        uname: "anna"
    },

    {
        name: "Proces",
        author: "Franz Kafka",
        isbn: "9780805209990",
        description: "Surrealistický příběh Josefa K. a jeho nepochopitelného soudního procesu.",
        pages: 240,
        state: "Velmi dobrý",
        price: 140,
        delivery: 60,
        uname: "tomas"
    },

    {
        name: "Duna",
        author: "Frank Herbert",
        isbn: "9780441172719",
        description: "Kultovní sci-fi román o planetě Arrakis, koření a boji o moc.",
        pages: 688,
        state: "Velmi dobrý",
        price: 280,
        delivery: 75,
        uname: "nikola"
    },

    {
        name: "Sapiens",
        author: "Yuval Noah Harari",
        isbn: "9780062316097",
        description: "Populárně naučná kniha o vývoji člověka a lidské civilizace.",
        pages: 464,
        state: "Velmi dobrý",
        price: 300,
        delivery: 70,
        uname: "martin"
    }

];

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function getUserByUsername(username) {
    return users.find(user => user.uname === username);
}

const booksWithImages = books.map((book) => ({
    ...book,
    image: `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
}));

// #region SEED

async function seedDatabase() {
    try {
        await mongoose.connect(mongoUrl);

        console.log("Připojeno k databázi MongoDB.\n");

        // Smazání aktuálních dat
        await User.deleteMany({});
        await Book.deleteMany({});

        console.log("Původní testovací data byla odstraněna.\n");

        // Vytvoří uživatele

        const usersWithHashedPasswords = await Promise.all(
            users.map(async (user) => {
                return {
                    uname: user.uname,
                    fname: user.fname,
                    lname: user.lname,
                    email: user.email,
                    phone: user.phone,
                    password: await bcrypt.hash(user.password, 10)
                };
            })
        );

        await User.insertMany(usersWithHashedPasswords);

        console.log(`Vytvořeno uživatelů: ${users.length}`); //!!

        // Vytvoří knihy

        const booksWithUserData = books.map(book => {
            const user = getUserByUsername(book.uname);

            return {
                name: book.name,
                author: book.author,
                description: book.description,
                pages: book.pages,
                state: book.state,
                price: book.price,
                delivery: book.delivery,
                fname: user.fname,
                lname: user.lname,
                uname: user.uname,
                phone: user.phone,
                image: `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` // tady nějak insertovat skutečné obrázky
            };
        });

        await Book.insertMany(booksWithUserData);

        console.log(`Vytvořeno knih: ${books.length}`); //!!

        console.log("Data do databáze byla úspěšně přidána.\n");

        console.log(""); //!!
        console.log("TESTOVACÍ PŘIHLÁŠENÍ:");
        console.log("------------------------------------");
        console.log("Uživatelské jméno: petra");
        console.log("Heslo: test123");
        console.log("------------------------------------");
        console.log("");

    } catch (error) {
        console.error("CHYBA PŘI NAPLOŇOVÁNÍ DATABÁZE:");
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log("Spojení s databází bylo ukončeno.");
    }
}

seedDatabase();