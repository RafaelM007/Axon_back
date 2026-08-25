const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const rankingController = require("../controllers/rankingController");

/**
 * @swagger
 * /groups/{groupId}/ranking:
 *   get:
 *     summary: Buscar ranking do grupo
 *     description: Retorna o ranking dos membros de um grupo, ordenado pela pontuação. Apenas membros do grupo podem acessar.
 *     tags:
 *       - Ranking
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID do grupo
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Ranking recuperado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64f123456789abcdef123456"
 *                     name:
 *                       type: string
 *                       example: "Grupo de Estudos"
 *                 totalMembers:
 *                   type: integer
 *                   example: 3
 *                 ranking:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       position:
 *                         type: integer
 *                         example: 1
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: "Rafael Moreira"
 *                           email:
 *                             type: string
 *                             format: email
 *                           profileImage:
 *                             nullable: true
 *                       points:
 *                         type: integer
 *                         minimum: 0
 *                         example: 25
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       403:
 *         description: Usuário não pertence ao grupo.
 *
 *       404:
 *         description: Grupo não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get(
    "/groups/:groupId/ranking",
    authMiddleware,
    rankingController.getGroupRanking
);

module.exports = router;