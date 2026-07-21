const express = require("express");

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes"); // 1. Importa as rotas de grupo
const taskRoutes = require("./routes/taskRoutes"); 

const app = express();

app.use(express.json());

app.use("/users", userRoutes);
app.use("/groups", groupRoutes); // 2. Vincula o prefixo /groups
app.use("/tasks", taskRoutes);

module.exports = app;
