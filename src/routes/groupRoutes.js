const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middleware/authMiddleware"); // Caminho 100% correto agora!

// Criar um novo grupo
router.post("/create", authMiddleware, groupController.createGroup);

// Entrar em um grupo existente
router.post("/join", authMiddleware, groupController.joinGroup);

// Detalhes de um grupo específico
router.get("/:id", authMiddleware, groupController.getGroupDetails);

// Excluir um grupo (Apenas criador)
router.delete("/:id", authMiddleware, groupController.deleteGroup);

// Sair de um grupo
router.delete("/:id/leave", authMiddleware, groupController.leaveGroup);

// Editar informações do grupo (Apenas criador)
router.put("/:id", authMiddleware, groupController.updateGroup);

module.exports = router;
