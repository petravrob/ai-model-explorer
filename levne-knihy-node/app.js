const express = require("express");
const cors = require("cors");

const modelRoutes = require("./routes/modelRoutes");

const {
    notFound,
    errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();


// Middleware

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);


// Routes

app.use("/api/models", modelRoutes);


// Error handling

app.use(notFound);
app.use(errorHandler);


module.exports = app;