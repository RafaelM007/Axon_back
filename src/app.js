const express = require("express");

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes"); 
const taskRoutes = require("./routes/taskRoutes"); 
const rankingRoutes = require("./routes/rankingRoutes"); 
const taskSubmissionRoutes = require("./routes/taskSubmissionRoutes");

const app = express();

app.use(express.json());

app.use("/users", userRoutes);
app.use("/groups", groupRoutes); 
app.use("/tasks", taskRoutes);
app.use("/", rankingRoutes); 
app.use("/task-submissions", taskSubmissionRoutes);

module.exports = app;
