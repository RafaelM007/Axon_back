const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

// Rota para criar grupos
router.post("/create", authMiddleware, groupController.createGroup);

// Rota para entrar em um grupo existente
router.post("/join", authMiddleware, groupController.joinGroup);

// NOVA ROTA: Buscar detalhes de um grupo específico por ID
router.get("/:id", authMiddleware, groupController.getGroupDetails);

module.exports = router;
