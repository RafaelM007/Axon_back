const express = require("express");
const router = express.Router();


const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

// Criar uma nova tarefa
router.post("/", authMiddleware, taskController.createTask);

// Listar tarefas dos grupos do usuário
router.get("/my", authMiddleware, taskController.getMyTasks);

// Histórico de tarefas do usuário
router.get("/history", authMiddleware, taskController.getTaskHistory);

// Listar tarefas de um grupo específico
router.get("/group/:groupId", authMiddleware, taskController.getGroupTasks);

// Detalhes de uma tarefa
router.get("/:id", authMiddleware, taskController.getTaskById);

// Atualizar uma tarefa
router.patch("/:id", authMiddleware, taskController.updateTask);

// Excluir uma tarefa
router.delete("/:id", authMiddleware, taskController.deleteTask);

module.exports = router;