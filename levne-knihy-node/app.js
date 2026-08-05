require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { status } = require("express/lib/response");
const app = express();
app.use(express.json({ limit: "300mb"}));
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const JWT = process.env.JWT_SECRET;
const mongoUrl = process.env.MONGO_URI;

mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
    })
    .then(() => {
        console.log("Connected to database");
    })
    .catch((e) => console.log(e));

app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ limit: '300mb' }));

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "3000mb"}));
app.use(bodyParser.urlencoded({limit: "3000mb", extended: true, parameterLimit:5000000000}));

require("./userDetails");
require("./bookDetails");

const User = mongoose.model("UserInfo");
const Book = mongoose.model("BookInfo");

app.post("/registrovat-se", async(req, res) => {
    const { uname, fname, lname, email, phone, password } = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);
    try{ 
        const usedUname = await User.findOne({ uname });
        const usedEmail = await User.findOne({ email });

        if(usedUname){
            return res.json({error: "Username already in use."});
        } 
        if (usedEmail){
            return res.json({error: "Email already in use."});
        }
        
        await User.create({
            uname, fname, lname, email, phone, password: encryptedPassword,
        })
        res.send({status: "ok"})
    } catch (error) {
        res.send({status: "error"})
    }
})

app.post("/uzivatel", async (req, res) => {
    try {
      const { fname, lname, email, phone, _id } = req.body;
      await User.findByIdAndUpdate(_id, {
        fname: fname,
        lname: lname,
        email: email,
        phone: phone,
      });
  
      res.json({ status: "ok" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error" });
    }
  });

app.post("/prihlasit-se", async(req, res) => {
    const { uname, password } = req.body;

    const user = await User.findOne({ uname });

    if(!user) {
        return res.json({ error: "User not found." })
    }
    if(await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({uname: user.uname }, JWT);

        if(res.status(201)){
            return res.json({ status: "ok", data: token})
        } else {
            return res.json({ error: "error bcrypt" })
        }
    }
    return res.json({ status: "error", error: "Invalid password"})
})

app.post("/", async (req, res) => { ///userData
    const { token } = req.body;

    try {
        const user = jwt.verify(token, JWT);
        const username = user.uname;
        User.findOne({ uname: username }).then((data) => {
            res.send({ status: "ok", data: data });
        }).catch((error) => {
            res.send({ status: "error", data: error });
        });
    } catch (error) { }
})



app.post("/pridat-inzerat", async (req, res) => {
    const { name, author, description, pages, state, price, base64, delivery, fname, lname, phone, uname } = req.body;
    try {
      await Book.create({name, author, description, pages, state, uname, price, image: base64, delivery, fname, lname, phone });
      res.send({ status: "ok" });
    } catch (error) {
      res.send({ status: "error" });
    }
  });

app.get("/", async (req, res) => {
    Book.find().then((data) => {
        res.send({ status: "ok", data: data });
    }).catch((error) => {
        console.log(error);
    });
})

app.delete("/moje-inzeraty/:bookId", async (req, res) => {
    try {
      const { bookId } = req.params;
      console.log(bookId);
      // Delete the user
      await Book.findByIdAndDelete(bookId);
  
      res.json({ status: "ok" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error" });
    }
  });


app.post("/moje-inzeraty/:bookId", async (req, res) => {
    try {
      const { bookId } = req.params;
      console.log(bookId);
      const { name, author, description, pages, state, price, delivery, fname, lname, phone, uname } = req.body;
      console.log(name, author);
      
      await Book.findByIdAndUpdate(bookId, {
        name: name,
        author: author,
        description: description,
        pages: pages,
        state: state,
        price: price,
        delivery: delivery,
        fname: fname,
        lname: lname,
        phone: phone,
        uname: uname
      });
  
      res.json({ status: "ok" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error" });
    }
  });

app.listen(5000, () => {
    console.log("Server started")
})