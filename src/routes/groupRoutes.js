const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Criar grupo
 *     description: Cria um novo grupo. O usuário autenticado se torna automaticamente administrador do grupo.
 *     tags:
 *       - Groups
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Grupo de Estudos"
 *               description:
 *                 type: string
 *                 example: "Grupo para organizar estudos e tarefas."
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Senha123"
 *               maxMembers:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 100
 *                 example: 10
 *
 *     responses:
 *       201:
 *         description: Grupo criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Grupo criado com sucesso."
 *                 group:
 *                   $ref: "#/components/schemas/Group"
 *
 *       400:
 *         description: Nome inválido, quantidade máxima de membros inválida ou erro de validação.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.post("/", authMiddleware, groupController.createGroup);

/**
 * @swagger
 * /groups/join:
 *   post:
 *     summary: Entrar em um grupo
 *     description: Permite que o usuário autenticado entre em um grupo utilizando o código do grupo e, quando necessário, a senha.
 *     tags:
 *       - Groups
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
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "ABC123"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Senha123"
 *
 *     responses:
 *       200:
 *         description: Usuário entrou no grupo com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Você entrou no grupo com sucesso."
 *                 group:
 *                   $ref: "#/components/schemas/Group"
 *
 *       400:
 *         description: Código não informado, senha obrigatória não informada ou grupo cheio.
 *
 *       401:
 *         description: Token inválido ou senha do grupo incorreta.
 *
 *       404:
 *         description: Grupo não encontrado.
 *
 *       409:
 *         description: Usuário já faz parte do grupo.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.post("/join", authMiddleware, groupController.joinGroup);

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Listar meus grupos
 *     description: Retorna todos os grupos dos quais o usuário autenticado participa.
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Lista de grupos recuperada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Group"
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get("/", authMiddleware, groupController.getGroups);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Buscar detalhes de um grupo
 *     description: Retorna os detalhes de um grupo específico. Apenas membros do grupo podem acessar.
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do grupo
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Detalhes do grupo recuperados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 code:
 *                   type: string
 *                 maxMembers:
 *                   type: integer
 *                 creator:
 *                   type: object
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *
 *       400:
 *         description: ID do grupo inválido.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       403:
 *         description: Usuário não faz parte do grupo.
 *
 *       404:
 *         description: Grupo não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get("/:id", authMiddleware, groupController.getGroupDetails);

/**
 * @swagger
 * /groups/{id}:
 *   put:
 *     summary: Atualizar grupo
 *     description: Atualiza os dados de um grupo. Apenas administradores do grupo podem realizar alterações.
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do grupo
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
 *               name:
 *                 type: string
 *                 example: "Grupo de Estudos Avançado"
 *               description:
 *                 type: string
 *                 example: "Grupo atualizado para estudos e projetos."
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NovaSenha123"
 *               maxMembers:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 100
 *                 example: 20
 *
 *     responses:
 *       200:
 *         description: Grupo atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Grupo atualizado com sucesso."
 *                 group:
 *                   $ref: "#/components/schemas/Group"
 *
 *       400:
 *         description: ID inválido, quantidade máxima inválida ou limite menor que a quantidade atual de membros.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       403:
 *         description: Usuário não faz parte do grupo ou não é administrador.
 *
 *       404:
 *         description: Grupo não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.put("/:id", authMiddleware, groupController.updateGroup);

/**
 * @swagger
 * /groups/{id}/members/{userId}/role:
 *   patch:
 *     summary: Alterar cargo de um membro
 *     description: Altera o cargo de um membro do grupo. Apenas administradores podem realizar essa alteração e não é permitido alterar o próprio cargo.
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do grupo
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID do usuário que terá o cargo alterado
 *         schema:
 *           type: string
 *         example: "64f987654321abcdef123456"
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum:
 *                   - admin
 *                   - member
 *                 example: "admin"
 *
 *     responses:
 *       200:
 *         description: Cargo atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cargo atualizado com sucesso."
 *                 group:
 *                   $ref: "#/components/schemas/Group"
 *
 *       400:
 *         description: ID inválido, cargo inválido ou tentativa de alterar o próprio cargo.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       403:
 *         description: Usuário autenticado não é administrador do grupo.
 *
 *       404:
 *         description: Grupo ou membro não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.patch(
    "/:id/members/:userId/role",
    authMiddleware,
    groupController.updateMemberRole
);

/**
 * @swagger
 * /groups/{id}/members/{userId}:
 *   delete:
 *     summary: Remover membro do grupo
 *     description: Remove um membro do grupo. Apenas administradores podem realizar a remoção. O administrador não pode remover a si mesmo nem o criador do grupo.
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do grupo
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID do usuário que será removido
 *         schema:
 *           type: string
 *         example: "64f987654321abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Membro removido com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Membro removido com sucesso."
 *                 group:
 *                   $ref: "#/components/schemas/Group"
 *
 *       400:
 *         description: ID inválido, tentativa de remover a si mesmo ou tentativa de remover o criador do grupo.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       403:
 *         description: Usuário autenticado não é administrador do grupo.
 *
 *       404:
 *         description: Grupo ou membro não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.delete(
    "/:id/members/:userId",
    authMiddleware,
    groupController.removeMember
);

/**
 * @swagger
 * /groups/{id}/leave:
 *   delete:
 *     summary: Sair do grupo
 *     description: Remove o usuário autenticado do grupo. O criador do grupo não pode sair; para encerrar o grupo, deve excluí-lo.
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do grupo
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Usuário saiu do grupo com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Você saiu do grupo com sucesso."
 *
 *       400:
 *         description: ID do grupo inválido ou tentativa do criador de sair do próprio grupo.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       404:
 *         description: Grupo não encontrado ou usuário não pertence ao grupo.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.delete("/:id/leave", authMiddleware, groupController.leaveGroup);

/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     summary: Excluir grupo
 *     description: Exclui definitivamente um grupo. Apenas o criador do grupo pode realizar essa operação.
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do grupo
 *         schema:
 *           type: string
 *         example: "64f123456789abcdef123456"
 *
 *     responses:
 *       200:
 *         description: Grupo excluído com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Grupo excluído com sucesso."
 *
 *       400:
 *         description: ID do grupo inválido.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       403:
 *         description: Usuário autenticado não é o criador do grupo.
 *
 *       404:
 *         description: Grupo não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.delete("/:id", authMiddleware, groupController.deleteGroup);

module.exports = router;
