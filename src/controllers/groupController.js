const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Group = require("../models/Group");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const generateGroupCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateUniqueGroupCode = async () => {

    let code;
    let exists = true;

    while (exists) {

        code = generateGroupCode();

        exists = await Group.findOne({ code });

    }

    return code;

};

// Criar grupo

const createGroup = async (req, res) => {
    try {

        const { name, description, password, maxMembers } = req.body;

        // Validação do nome
        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "O nome do grupo é obrigatório."
            });
        }

        // Validação da quantidade máxima
        if (
            maxMembers !== undefined &&
            (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 100)
        ) {
            return res.status(400).json({
                message: "A quantidade máxima de membros deve estar entre 2 e 100."
            });
        }

        // Usuário autenticado
        const userId = req.user.id || req.user._id;

        // Gera um código único
        const code = await generateUniqueGroupCode();

        // Cria o grupo
        const group = await Group.create({

            name,

            description: description || "",

            password: password?.trim() || "",

            maxMembers: maxMembers || 10,

            code,

            creator: userId,

            members: [
                {
                    user: userId,
                    role: "admin",
                    points: 0
                }
            ]

        });

        return res.status(201).json({
            message: "Grupo criado com sucesso.",
            group
        });

    } catch (error) {

        console.error(error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Entrar em um grupo

const joinGroup = async (req, res) => {
    try {

        const { code, password } = req.body;

        // Código obrigatório
        if (!code || code.trim() === "") {
            return res.status(400).json({
                message: "O código do grupo é obrigatório."
            });
        }

        const userId = req.user.id || req.user._id;

        // Procura o grupo pelo código
        const group = await Group.findOne({
            code: code.trim().toUpperCase()
        }).select("+password");

        if (!group) {
            return res.status(404).json({
                message: "Grupo não encontrado."
            });
        }

        // Verifica senha (caso o grupo possua)
        if (group.password) {

            if (!password) {
                return res.status(400).json({
                    message: "Este grupo possui senha."
                });
            }

            const isMatch = await bcrypt.compare(password, group.password);

            if (!isMatch) {
                return res.status(401).json({
                    message: "Senha incorreta."
                });
            }
        }

        // Verifica se já participa
        const alreadyMember = group.members.some(
            member => member.user.toString() === userId.toString()
        );

        if (alreadyMember) {
            return res.status(409).json({
                message: "Você já faz parte deste grupo."
            });
        }

        // Grupo cheio
        if (group.members.length >= group.maxMembers) {
            return res.status(400).json({
                message: "O grupo atingiu o limite máximo de membros."
            });
        }

        // Adiciona novo membro
        group.members.push({
            user: userId,
            role: "member",
            points: 0
        });

        await group.save();

        return res.status(200).json({
            message: "Você entrou no grupo com sucesso.",
            group
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Listar grupos do usuário

const getGroups = async (req, res) => {
    try {

        const userId = req.user.id || req.user._id;

        const groups = await Group.find({
            "members.user": userId
        })
        .select("name description code maxMembers members createdAt");

        return res.status(200).json(groups);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Buscar detalhes de um grupo

const getGroupDetails = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "ID do grupo inválido."
            });
        }

        const userId = req.user.id || req.user._id;

        const group = await Group.findById(id)
            .populate("creator", "name email profileImage")
            .populate("members.user", "name email profileImage");

        if (!group) {
            return res.status(404).json({
                message: "Grupo não encontrado."
            });
        }

        // Verifica se o usuário pertence ao grupo
        const isMember = group.members.some(
            member => member.user._id.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Você não faz parte deste grupo."
            });
        }

        return res.status(200).json({
          id: group._id,
          name: group.name,
          description: group.description,
          code: group.code,
          maxMembers: group.maxMembers,
          creator: group.creator,
          members: group.members
      });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Atualizar grupo
const updateGroup = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, description, password, maxMembers } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "ID do grupo inválido."
            });
        }

        const userId = req.user.id || req.user._id;

        const group = await Group.findById(id).select("+password");

        if (!group) {
            return res.status(404).json({
                message: "Grupo não encontrado."
            });
        }

        // Procura o usuário dentro do grupo
        const member = group.members.find(
            member => member.user.toString() === userId.toString()
        );

        if (!member) {
            return res.status(403).json({
                message: "Você não faz parte deste grupo."
            });
        }

        // Apenas admins podem editar
        if (member.role !== "admin") {
            return res.status(403).json({
                message: "Apenas administradores podem editar o grupo."
            });
        }

        // Atualiza apenas os campos enviados
        if (name !== undefined)
            group.name = name;

        if (description !== undefined)
            group.description = description;

        if (password !== undefined)
            group.password = password ? password.trim() : "";

        if (maxMembers !== undefined) {

            if (
                isNaN(maxMembers) ||
                maxMembers < 2 ||
                maxMembers > 100
            ) {
                return res.status(400).json({
                    message:
                        "A quantidade máxima deve estar entre 2 e 100."
                });
            }

            if (maxMembers < group.members.length) {
                return res.status(400).json({
                    message:
                        "A quantidade máxima não pode ser menor que a quantidade atual de membros."
                });
            }

            group.maxMembers = maxMembers;
        }

        await group.save();

        return res.status(200).json({
            message: "Grupo atualizado com sucesso.",
            group
        });

    } catch (error) {

        console.error(error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Alterar cargo de um membro

const updateMemberRole = async (req, res) => {
    try {

        const { id, userId } = req.params;
        const { role } = req.body;

        if (!isValidObjectId(id) || !isValidObjectId(userId)) {
            return res.status(400).json({
                message: "ID inválido."
            });
        }

        if (!["admin", "member"].includes(role)) {
            return res.status(400).json({
                message: "Cargo inválido."
            });
        }

        const loggedUser = req.user.id || req.user._id;

        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({
                message: "Grupo não encontrado."
            });
        }

        // Admin logado
        const admin = group.members.find(
            member => member.user.toString() === loggedUser.toString()
        );

        if (!admin || admin.role !== "admin") {
            return res.status(403).json({
                message: "Apenas administradores podem alterar cargos."
            });
        }

        // Não pode alterar o próprio cargo
        if (loggedUser.toString() === userId.toString()) {
            return res.status(400).json({
                message: "Você não pode alterar seu próprio cargo."
            });
        }

        // Procura o membro
        const member = group.members.find(
            member => member.user.toString() === userId.toString()
        );

        if (!member) {
            return res.status(404).json({
                message: "Membro não encontrado."
            });
        }

        member.role = role;

        await group.save();

        return res.status(200).json({
            message: "Cargo atualizado com sucesso.",
            group
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Remover membro do grupo
const removeMember = async (req, res) => {
    try {

        const { id, userId } = req.params;

        if (!isValidObjectId(id) || !isValidObjectId(userId)) {
            return res.status(400).json({
                message: "ID inválido."
            });
        }

        const loggedUser = req.user.id || req.user._id;

        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({
                message: "Grupo não encontrado."
            });
        }

        // Verifica se quem está logado é admin
        const admin = group.members.find(
            member => member.user.toString() === loggedUser.toString()
        );

        if (!admin || admin.role !== "admin") {
            return res.status(403).json({
                message: "Apenas administradores podem remover membros."
            });
        }

        // Não pode remover a si mesmo
        if (loggedUser.toString() === userId.toString()) {
            return res.status(400).json({
                message: "Use a opção de sair do grupo."
            });
        }

        // Não pode remover o criador
        if (group.creator.toString() === userId.toString()) {
            return res.status(400).json({
                message: "O criador do grupo não pode ser removido."
            });
        }

        const member = group.members.find(
            member => member.user.toString() === userId.toString()
        );

        if (!member) {
            return res.status(404).json({
                message: "Membro não encontrado."
            });
        }

        group.members = group.members.filter(
            member => member.user.toString() !== userId.toString()
        );

        await group.save();

        return res.status(200).json({
            message: "Membro removido com sucesso.",
            group
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Sair do grupo
const leaveGroup = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "ID do grupo inválido."
            });
        }

        const userId = req.user.id || req.user._id;

        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({
                message: "Grupo não encontrado."
            });
        }

        // Criador não pode sair
        if (group.creator.toString() === userId.toString()) {
            return res.status(400).json({
                message: "O criador do grupo não pode sair. Caso deseje encerrar o grupo, exclua-o."
            });
        }

        // Verifica se o usuário pertence ao grupo
        const isMember = group.members.some(
            member => member.user.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(404).json({
                message: "Você não faz parte deste grupo."
            });
        }

        // Remove o usuário
        group.members = group.members.filter(
            member => member.user.toString() !== userId.toString()
        );

        await group.save();

        return res.status(200).json({
            message: "Você saiu do grupo com sucesso."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Excluir grupo
const deleteGroup = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "ID do grupo inválido."
            });
        }

        const userId = req.user.id || req.user._id;

        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({
                message: "Grupo não encontrado."
            });
        }

        // Apenas o criador pode excluir
        if (group.creator.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "Apenas o criador pode excluir este grupo."
            });
        }

        await Group.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Grupo excluído com sucesso."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

module.exports = {
    createGroup,
    joinGroup,
    getGroups,
    getGroupDetails,
    updateGroup,
    updateMemberRole,
    removeMember,
    leaveGroup,
    deleteGroup
};