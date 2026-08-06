const express = require("express");

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes"); 
const taskRoutes = require("./routes/taskRoutes"); 

const rankingRoutes = require("./routes/rankingRoutes"); // 1. Importa as rotas de ranking
const taskSubmissionRoutes = require("./routes/taskSubmissionRoutes");

const app = express();

app.use(express.json());

app.use("/users", userRoutes);
app.use("/groups", groupRoutes); 
app.use("/tasks", taskRoutes);
app.use("/", rankingRoutes); // 2. Vincula o prefixo /ranking // Somente com o "/" pois os endpoints de contestação, votação e ranking baterão exatamente com as rotas descritas no requisito da sua tarefa!
app.use("/task-submissions", taskSubmissionRoutes);

module.exports = app;
