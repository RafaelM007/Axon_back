const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

const userController = require("../controllers/userController");

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Cadastrar usuário
 *     description: Cria uma nova conta de usuário na plataforma.
 *     tags:
 *       - Users
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - birthDate
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rafael Moreira"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "rafael@email.com"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "2006-05-15"
 *               phone:
 *                 type: string
 *                 example: "35999999999"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Senha123"
 *
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso.
 *
 *       400:
 *         description: Dados inválidos ou campos obrigatórios não preenchidos.
 *
 *       409:
 *         description: E-mail já cadastrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.post("/register", userController.register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Realizar login
 *     description: Autentica o usuário e retorna um JWT válido por 7 dias.
 *     tags:
 *       - Users
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "rafael@email.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Senha123"
 *
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login realizado com sucesso."
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *
 *       400:
 *         description: E-mail ou senha não informados.
 *
 *       401:
 *         description: E-mail ou senha inválidos.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Buscar perfil do usuário autenticado
 *     description: Retorna os dados do perfil do usuário atualmente autenticado.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Perfil recuperado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil recuperado com sucesso."
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       404:
 *         description: Usuário não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.get("/me", authMiddleware, userController.getProfile);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Atualizar perfil
 *     description: Atualiza os dados pessoais do usuário autenticado. Apenas os campos enviados serão alterados.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
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
 *                 example: "Rafael Moreira"
 *               phone:
 *                 type: string
 *                 example: "35999999999"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "2006-05-15"
 *
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil atualizado com sucesso."
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *
 *       400:
 *         description: Nenhum dado foi enviado para atualização.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       404:
 *         description: Usuário não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.put("/me", authMiddleware, userController.updateProfile);

/**
 * @swagger
 * /users/profile-image:
 *   patch:
 *     summary: Atualizar foto de perfil
 *     description: Envia uma nova imagem de perfil para o usuário autenticado. A imagem é armazenada no Cloudinary.
 *     tags:
 *       - Users
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
 *               - profileImage
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: Foto de perfil atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Foto de perfil atualizada com sucesso."
 *                 profileImage:
 *                   type: string
 *                   example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *
 *       400:
 *         description: Nenhuma imagem foi enviada ou arquivo inválido.
 *
 *       401:
 *         description: Token ausente ou inválido.
 *
 *       404:
 *         description: Usuário não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.patch(
    "/profile-image",
    authMiddleware,
    upload.single("profileImage"),
    userController.updateProfileImage
);

/**
 * @swagger
 * /users/change-password:
 *   patch:
 *     summary: Alterar senha
 *     description: Altera a senha do usuário autenticado após validar a senha atual e os requisitos da nova senha.
 *     tags:
 *       - Users
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
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "Senha123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NovaSenha123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "NovaSenha123"
 *
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Senha alterada com sucesso."
 *
 *       400:
 *         description: Dados inválidos, nova senha igual à atual, senha fora dos requisitos ou confirmação diferente.
 *
 *       401:
 *         description: Token inválido ou senha atual incorreta.
 *
 *       404:
 *         description: Usuário não encontrado.
 *
 *       500:
 *         description: Erro interno do servidor.
 */
router.patch(
    "/change-password",
    authMiddleware,
    userController.changePassword
);

module.exports = router;