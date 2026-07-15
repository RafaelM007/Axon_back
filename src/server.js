const express = require("express");
require("dotenv").config();

const app = express();

const connectDatabase = require("./config/database");

const startServer = async () => {
    await connectDatabase();

    app.listen(process.env.PORT, () => {
        console.log(`Servidor rodando na porta ${process.env.PORT }`);
    });
};

startServer();