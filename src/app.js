const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes"); 
const taskRoutes = require("./routes/taskRoutes"); 
const rankingRoutes = require("./routes/rankingRoutes"); 
const taskSubmissionRoutes = require("./routes/taskSubmissionRoutes");

const app = express();

app.use(express.json());

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use("/users", userRoutes);
app.use("/groups", groupRoutes); 
app.use("/tasks", taskRoutes);
app.use("/", rankingRoutes); 
app.use("/task-submissions", taskSubmissionRoutes);

module.exports = app;
