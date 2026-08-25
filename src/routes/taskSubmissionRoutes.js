const express = require("express");
const router = express.Router();

const taskSubmissionController = require("../controllers/taskSubmissionController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


/**
 * @swagger
 * /task-submissions:
 *   post:
 *     summary: Enviar evidência
 *     description: Envia uma imagem como evidência para uma tarefa. O usuário precisa pertencer ao grupo e a tarefa deve estar dentro do período de realização.
 *     tags:
 *       - Task Submissions
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - task
 *               - evidence
 *             properties:
 *               task:
 *                 type: string
 *                 description: ID da tarefa
 *                 example: "64f123456789abcdef123456"
 *               evidence:
 *                 type: string
 *                 format: binary
 *                 description: Imagem utilizada como evidência
 *
 *     responses:
 *       201:
 *         description: Evidência enviada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Evidência enviada com sucesso."
 *                 submission:
 *                   $ref: "#/components/schemas/TaskSubmission"
 *
 *       400:
 *         description: Imagem ou tarefa não informada, tarefa ainda não iniciada ou prazo encerrado.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       403:
 *         description: Usuário não pertence ao grupo da tarefa.
 *
 *       404:
 *         description: Tarefa ou grupo da tarefa não encontrado.
 *
 *       409:
 *         description: Usuário já enviou uma evidência para esta tarefa.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.post(
    "/",
    authMiddleware,
    upload.single("evidence"),
    taskSubmissionController.submitEvidence
);

/**
 * @swagger
 * /task-submissions/my:
 *   get:
 *     summary: Buscar minhas evidências
 *     description: Retorna todas as evidências enviadas pelo usuário autenticado, ordenadas da mais recente para a mais antiga.
 *     tags:
 *       - Task Submissions
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Evidências recuperadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submissions:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TaskSubmission"
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get("/my", authMiddleware, taskSubmissionController.getMySubmissions);


/**
 * @swagger
 * /task-submissions/pending:
 *   get:
 *     summary: Buscar evidências pendentes para validação
 *     description: Retorna as evidências que o usuário autenticado ainda pode validar. Não inclui evidências próprias, já validadas pelo usuário ou relacionadas a tarefas com prazo encerrado.
 *     tags:
 *       - Task Submissions
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Evidências pendentes recuperadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submissions:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TaskSubmission"
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get("/pending", authMiddleware, taskSubmissionController.getPendingValidations);


/**
 * @swagger
 * /task-submissions/{id}:
 *   get:
 *     summary: Buscar detalhes de uma evidência
 *     description: Retorna os detalhes de uma evidência específica. Apenas membros do grupo da tarefa podem acessar.
 *     tags:
 *       - Task Submissions
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da evidência
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Evidência recuperada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submission:
 *                   $ref: "#/components/schemas/TaskSubmission"
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       403:
 *         description: Usuário não possui acesso à evidência.
 *
 *       404:
 *         description: Evidência, tarefa ou grupo da evidência não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get("/:id", authMiddleware, taskSubmissionController.getSubmissionById);


/**
 * @swagger
 * /task-submissions/{id}/validate:
 *   patch:
 *     summary: Validar ou contestar uma evidência
 *     description: Permite que um membro do grupo aprove ou conteste uma evidência durante a etapa de validação inicial.
 *     tags:
 *       - Task Submissions
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da evidência
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
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum:
 *                   - approved
 *                   - contested
 *                 example: "approved"
 *               reason:
 *                 type: string
 *                 description: Obrigatório quando action for contested.
 *                 example: "A evidência não comprova a realização da tarefa."
 *
 *     responses:
 *       200:
 *         description: Evidência validada ou contestada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Evidência aprovada com sucesso."
 *                 submission:
 *                   $ref: "#/components/schemas/TaskSubmission"
 *
 *       400:
 *         description: Decisão inválida, motivo ausente, prazo encerrado ou evidência indisponível para validação.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       403:
 *         description: Usuário não pode validar a própria evidência ou não pertence ao grupo.
 *
 *       404:
 *         description: Evidência, tarefa ou grupo não encontrado.
 *
 *       409:
 *         description: Usuário já realizou uma validação inicial para esta evidência.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.patch("/:id/validate", authMiddleware, taskSubmissionController.validateSubmission);


/**
 * @swagger
 * /task-submissions/{id}/vote:
 *   patch:
 *     summary: Votar em uma contestação
 *     description: Permite que um membro elegível vote em uma evidência contestada.
 *     tags:
 *       - Task Submissions
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da evidência
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
 *             required:
 *               - decision
 *             properties:
 *               decision:
 *                 type: string
 *                 enum:
 *                   - accepted
 *                   - invalidated
 *                 example: "accepted"
 *
 *     responses:
 *       200:
 *         description: Voto registrado ou votação finalizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Voto registrado com sucesso."
 *                 finalDecision:
 *                   type: string
 *                   enum:
 *                     - accepted
 *                     - invalidated
 *                   nullable: true
 *                 submission:
 *                   $ref: "#/components/schemas/TaskSubmission"
 *
 *       400:
 *         description: Decisão inválida ou evidência não está em votação.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       403:
 *         description: Usuário não pode votar, é o autor da evidência, abriu a contestação ou não pertence ao grupo.
 *
 *       404:
 *         description: Evidência, tarefa ou grupo não encontrado.
 *
 *       409:
 *         description: Usuário já votou nesta evidência.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.patch("/:id/vote", authMiddleware, taskSubmissionController.voteSubmission);


module.exports = router;