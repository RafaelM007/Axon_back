const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteSubmission,
  contestTask,
  getTaskSubmissions,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(authMiddleware);

// Criar uma tarefa (criador do grupo)
router.post("/", createTask);

// Listar tarefas
router.get("/", getTasks);

// Enviar evidência da tarefa
router.put("/:id", upload.single("image"), updateTask);

// Remover minha evidência
router.delete("/:id/submission", deleteSubmission);

// Contestar uma evidência
router.patch("/:id/contest", contestTask);

// Listar todas as evidências da tarefa
router.get("/:id/submissions", getTaskSubmissions);

module.exports = router;