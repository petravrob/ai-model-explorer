const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("./models/User.js");
require("dotenv").config();


const User = mongoose.model("User");

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

// #region SEED

async function seedDatabase() {
    try {
        await mongoose.connect(mongoUrl);

        console.log("Připojeno k databázi MongoDB.\n");

        // Smazání aktuálních dat
        await User.deleteMany({});

        console.log("Původní testovací uživatelé byli odstraněni.\n");

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

        console.log(`Vytvořeno uživatelů: ${users.length}`);

        console.log("Modely se do databáze plní samostatně příkazem npm run import:models.\n");

        console.log("");
        console.log("TESTOVACÍ PŘIHLÁŠENÍ:");
        console.log("------------------------------------");
        console.log("Uživatelské jméno: petra");
        console.log("Heslo: test123");
        console.log("------------------------------------");
        console.log("");

    } catch (error) {
        console.error("CHYBA PŘI NAPLŇOVÁNÍ DATABÁZE:");
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log("Spojení s databází bylo ukončeno.");
    }
}

seedDatabase();
