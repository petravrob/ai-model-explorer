const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const modelRoutes = require("./routes/modelRoutes");

const {
    notFound,
    errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();


// Middleware

app.use(cors());

app.use(
    express.json({
        limit: "300mb",
    })
);

app.use(
    express.urlencoded({
        limit: "300mb",
        extended: true,
    })
);


// Routes

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/api/models", modelRoutes);


// Error handling

app.use(notFound);
app.use(errorHandler);


module.exports = app;