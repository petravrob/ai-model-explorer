const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { JWT_SECRET } = require("../config/env");

const register = async (req, res) => {
    try {
        const {
            uname,
            fname,
            lname,
            email,
            phone,
            password,
        } = req.body;

        const [usedUname, usedEmail] = await Promise.all([
            User.findOne({ uname }),
            User.findOne({ email }),
        ]);

        if (usedUname) {
            return res.status(409).json({
                status: "error",
                error: "Uživatelské jméno již používá jiný uživatel.",
            });
        }

        if (usedEmail) {
            return res.status(409).json({
                status: "error",
                error: "E-mailová adresa již používá jiný uživatel.",
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        await User.create({
            uname,
            fname,
            lname,
            email,
            phone,
            password: encryptedPassword,
        });

        // Po úspěšné registraci se rovnou vystaví token,
        // aby mohl být uživatel ihned přihlášen.
        const token = jwt.sign(
            {
                uname: uname,
            },
            JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        return res.status(201).json({
            status: "ok",
            token,
        });
    } catch (error) {
        console.error("Registration failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Registrace se nezdařila.",
        });
    }
};

const login = async (req, res) => {
    try {
        const { uname, password } = req.body;

        const user = await User.findOne({ uname });

        if (!user) {
            return res.status(404).json({
                status: "error",
                error: "Uživatel nebyl nalezen.",
            });
        }

        const passwordIsValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).json({
                status: "error",
                error: "Nesprávné heslo.",
            });
        }

        const token = jwt.sign(
            {
                uname: user.uname,
            },
            JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        return res.status(200).json({
            status: "ok",
            token,
        });
    } catch (error) {
        console.error("Login failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Přihlášení se nezdařilo.",
        });
    }
};

module.exports = {
    register,
    login,
};
