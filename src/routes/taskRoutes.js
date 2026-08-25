const express = require("express");
const router = express.Router();


const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Criar uma nova tarefa
 *     description: Cria uma tarefa para um grupo. Apenas administradores do grupo podem criar tarefas.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - group
 *               - points
 *               - startsAt
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Estudar Node.js"
 *               description:
 *                 type: string
 *                 example: "Estudar Express e MongoDB."
 *               points:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *               group:
 *                 type: string
 *                 example: "64f123456789abcdef123456"
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-24T15:00:00.000Z"
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-24T18:00:00.000Z"
 *               isRecurring:
 *                 type: boolean
 *                 example: false
 *               recurrence:
 *                 type: object
 *                 properties:
 *                   frequency:
 *                     type: string
 *                     enum: [none, daily, weekly, monthly]
 *                     example: none
 *                   occurrences:
 *                     type: integer
 *                     example: 1
 *
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tarefa criada com sucesso."
 *                 task:
 *                   $ref: "#/components/schemas/Task"
 *
 *       400:
 *         description: Dados obrigatórios inválidos ou prazo anterior ao início.
 *
 *       401:
 *         description: Usuário não autenticado.
 *
 *       403:
 *         description: Usuário não pertence ao grupo ou não é administrador.
 *
 *       404:
 *         description: Grupo não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.post("/", authMiddleware, taskController.createTask);

/**
 * @swagger
 * /tasks/my:
 *   get:
 *     summary: Listar minhas tarefas
 *     description: Retorna as tarefas ativas dos grupos dos quais o usuário autenticado participa, ordenadas pelo prazo mais próximo.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Tarefas recuperadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tarefas recuperadas com sucesso."
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Task"
 *
 *       401:
 *         description: Usuário não autenticado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get("/my", authMiddleware, taskController.getMyTasks);

/**
 * @swagger
 * /tasks/history:
 *   get:
 *     summary: Histórico de tarefas
 *     description: Retorna o histórico de tarefas encerradas relacionadas aos grupos do usuário.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Histórico recuperado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Histórico de tarefas recuperado com sucesso."
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Task"
 *
 *       401:
 *         description: Usuário não autenticado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get("/history", authMiddleware, taskController.getTaskHistory);

/**
 * @swagger
 * /tasks/group/{groupId}:
 *   get:
 *     summary: Listar tarefas de um grupo
 *     description: Retorna as tarefas de um grupo específico. Apenas membros do grupo podem acessar.
 *     tags:
 *       - Tasks
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
 *         description: Tarefas do grupo recuperadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tarefas do grupo recuperadas com sucesso."
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Task"
 *
 *       401:
 *         description: Usuário não autenticado.
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
router.get("/group/:groupId", authMiddleware, taskController.getGroupTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Buscar tarefa por ID
 *     description: Retorna os detalhes de uma tarefa. Apenas membros do grupo da tarefa podem acessá-la.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da tarefa
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Tarefa recuperada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tarefa recuperada com sucesso."
 *                 task:
 *                   $ref: "#/components/schemas/Task"
 *
 *       401:
 *         description: Usuário não autenticado.
 *
 *       403:
 *         description: Usuário não pertence ao grupo da tarefa.
 *
 *       404:
 *         description: Tarefa não encontrada.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get("/:id", authMiddleware, taskController.getTaskById);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Atualizar uma tarefa
 *     description: Atualiza os dados de uma tarefa. Apenas administradores do grupo podem realizar a alteração.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da tarefa
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Estudar Node.js"
 *               description:
 *                 type: string
 *                 example: "Estudar Express e MongoDB."
 *               points:
 *                 type: integer
 *                 minimum: 1
 *                 example: 15
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-24T15:00:00.000Z"
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-24T18:00:00.000Z"
 *
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tarefa atualizada com sucesso."
 *                 task:
 *                   $ref: "#/components/schemas/Task"
 *
 *       400:
 *         description: Dados inválidos ou alteração não permitida.
 *
 *       401:
 *         description: Usuário não autenticado.
 *
 *       403:
 *         description: Usuário não é administrador do grupo.
 *
 *       404:
 *         description: Tarefa ou grupo não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.patch("/:id", authMiddleware, taskController.updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Excluir uma tarefa
 *     description: Exclui uma tarefa. Apenas administradores do grupo podem realizar a exclusão.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da tarefa
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Tarefa excluída com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tarefa excluída com sucesso."
 *
 *       401:
 *         description: Usuário não autenticado.
 *
 *       403:
 *         description: Usuário não é administrador do grupo.
 *
 *       404:
 *         description: Tarefa ou grupo não encontrado.
 *
 *       409:
 *         description: A tarefa possui evidências vinculadas e não pode ser excluída.
 * 
 *       500:
 *         description: Erro interno do servidor.
 */
router.delete("/:id", authMiddleware, taskController.deleteTask);

module.exports = router;