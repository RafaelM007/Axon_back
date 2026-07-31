const express = require("express");
const router = express.Router();

// 1. Importando as funções criadas no rankingController
const {
  contestTask,
  voteContest,
  getGroupRanking,
} = require("../controllers/rankingController");

// 2. Importando o middleware de autenticação
const authMiddleware = require("../middleware/authMiddleware");

// Rota para contestar uma tarefa
// POST /tasks/:id/contest
router.post("/tasks/:id/contest", authMiddleware, contestTask);

// Rota para votar em uma contestação
// POST /tasks/:id/vote
router.post("/tasks/:id/vote", authMiddleware, voteContest);

// Rota para buscar o ranking do grupo
// GET /groups/:id/ranking
router.get("/groups/:id/ranking", authMiddleware, getGroupRanking);

module.exports = router;