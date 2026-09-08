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

// #region MODEL PLACEHOLDER IMAGE

// Modely dostanou jednoduchý placeholder obrázek.
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
                AI Modely
            </text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// #endregion


// #region MODELS
const models = [

    {
        name: "GPT-4o",
        author: "OpenAI",
        description: "Univerzální multimodální model pro text i obrázky, vhodný pro chatovací asistenty.",
        pages: 200,
        state: "Velmi dobrý",
        price: 100,
        delivery: 55,
        uname: "tomas"
    },

    {
        name: "GPT-3.5 Turbo",
        author: "OpenAI",
        description: "Rychlý a levný model pro běžnou konverzaci a generování textu.",
        pages: 175,
        state: "Dobrý",
        price: 160,
        delivery: 60,
        uname: "katerina"
    },

    {
        name: "Claude 3.5 Sonnet",
        author: "Anthropic",
        description: "Konverzační model zaměřený na dlouhé dokumenty, analýzu a bezpečné odpovědi.",
        pages: 175,
        state: "Velmi dobrý",
        price: 110,
        delivery: 55,
        uname: "ondrej"
    },

    {
        name: "Claude 3 Haiku",
        author: "Anthropic",
        description: "Malý a velmi rychlý model pro jednoduché úlohy a klasifikaci textu.",
        pages: 20,
        state: "Dobrý",
        price: 220,
        delivery: 65,
        uname: "tereza"
    },

    {
        name: "Gemini 1.5 Flash",
        author: "Google",
        description: "Rychlý multimodální model s velkým kontextovým oknem.",
        pages: 8,
        state: "Velmi dobrý",
        price: 230,
        delivery: 65,
        uname: "michal"
    },

    {
        name: "Gemini 1.5 Pro",
        author: "Google",
        description: "Výkonný multimodální model pro složité úlohy a práci s dlouhými dokumenty.",
        pages: 400,
        state: "Dobrý",
        price: 240,
        delivery: 65,
        uname: "veronika"
    },

    {
        name: "Llama 3 70B",
        author: "Meta",
        description: "Otevřený velký jazykový model pro chat, sumarizaci i programování.",
        pages: 70,
        state: "Dobrý",
        price: 250,
        delivery: 70,
        uname: "david"
    },

    {
        name: "Llama 3 8B",
        author: "Meta",
        description: "Menší otevřený model vhodný pro nasazení na běžném hardwaru.",
        pages: 8,
        state: "Dobrý",
        price: 170,
        delivery: 60,
        uname: "filip"
    },

    {
        name: "Mistral 7B",
        author: "Mistral AI",
        description: "Efektivní otevřený model s dobrým poměrem výkonu a rychlosti.",
        pages: 7,
        state: "Velmi dobrý",
        price: 130,
        delivery: 55,
        uname: "barbora"
    },

    {
        name: "Mixtral 8x7B",
        author: "Mistral AI",
        description: "Model smíšených expertů s vysokou kvalitou odpovědí při nízké latenci.",
        pages: 47,
        state: "Dobrý",
        price: 120,
        delivery: 55,
        uname: "petra"
    },

    {
        name: "Command R+",
        author: "Cohere",
        description: "Model optimalizovaný pro vyhledávání v dokumentech a práci s citacemi (RAG).",
        pages: 104,
        state: "Velmi dobrý",
        price: 190,
        delivery: 65,
        uname: "jan"
    },

    {
        name: "DeepSeek V3",
        author: "DeepSeek",
        description: "Velký otevřený model silný v programování a matematickém uvažování.",
        pages: 671,
        state: "Dobrý",
        price: 180,
        delivery: 65,
        uname: "lucie"
    },

    {
        name: "Qwen 2 72B",
        author: "Alibaba",
        description: "Vícejazyčný otevřený model s podporou mnoha jazyků a kódování.",
        pages: 72,
        state: "Dobrý",
        price: 220,
        delivery: 75,
        uname: "martin"
    },

    {
        name: "Grok-1",
        author: "xAI",
        description: "Otevřený model známý netradičním humorem v odpovědích.",
        pages: 314,
        state: "Dobrý",
        price: 250,
        delivery: 80,
        uname: "anna"
    },

    {
        name: "Whisper Large v3",
        author: "OpenAI",
        description: "Model pro převod řeči na text s podporou mnoha jazyků.",
        pages: 2,
        state: "Velmi dobrý",
        price: 140,
        delivery: 60,
        uname: "tomas"
    },

    {
        name: "Stable Diffusion XL",
        author: "Stability AI",
        description: "Generování obrázků z textového popisu ve vysoké kvalitě.",
        pages: 4,
        state: "Velmi dobrý",
        price: 280,
        delivery: 75,
        uname: "nikola"
    },

    {
        name: "BERT Large",
        author: "Google",
        description: "Klasický model pro porozumění textu, klasifikaci a vyhledávání.",
        pages: 1,
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


// #region SEED

async function seedDatabase() {
    try {
        await mongoose.connect(mongoUrl);

        console.log("Připojeno k databázi MongoDB.\n");

        // Smazání aktuálních dat
        await User.deleteMany({});
        await AIModel.deleteMany({});

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

        console.log(`Vytvořeno uživatelů: ${users.length}`);

        // Vytvoří modely

        const modelsWithUserData = models.map(model => {
            const user = getUserByUsername(model.uname);

            return {
                name: model.name,
                author: model.author,
                description: model.description,
                pages: model.pages,
                state: model.state,
                price: model.price,
                delivery: model.delivery,
                fname: user.fname,
                lname: user.lname,
                uname: user.uname,
                phone: user.phone,
                image: createPlaceholder(model.name)
            };
        });

        await AIModel.insertMany(modelsWithUserData);

        console.log(`Vytvořeno modelů: ${models.length}`);

        console.log("Data do databáze byla úspěšně přidána.\n");

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
