const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

// Criar grupo
router.post("/", authMiddleware, groupController.createGroup);

// Entrar em um grupo
router.post("/join", authMiddleware, groupController.joinGroup);

// Listar meus grupos
router.get("/", authMiddleware, groupController.getGroups);

// Buscar detalhes de um grupo
router.get("/:id", authMiddleware, groupController.getGroupDetails);

// Editar grupo
router.put("/:id", authMiddleware, groupController.updateGroup);

// Alterar cargo de um membro
router.patch(
    "/:id/members/:userId/role",
    authMiddleware,
    groupController.updateMemberRole
);

// Remover membro
router.delete(
    "/:id/members/:userId",
    authMiddleware,
    groupController.removeMember
);

// Sair do grupo
router.delete("/:id/leave", authMiddleware, groupController.leaveGroup);

// Excluir grupo
router.delete("/:id", authMiddleware, groupController.deleteGroup);

module.exports = router;
