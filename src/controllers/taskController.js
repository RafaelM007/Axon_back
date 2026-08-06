const mongoose = require("mongoose");
const Task = require("../models/Task");
const Group = require("../models/Group");

// criar uma nova tarefa

const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            points,
            group,
            startsAt,
            deadline,
            isRecurring,
            recurrence
        } = req.body;

        // Campos obrigatórios
        if (
            !title?.trim() ||
            !group ||
            !startsAt ||
            !deadline ||
            points == null
        ) {
            return res.status(400).json({
                message: "Todos os campos obrigatórios devem ser preenchidos."
            });
        }
        // Datas
        const startDate = new Date(startsAt);
        const deadlineDate = new Date(deadline);
        if (startDate >= deadlineDate) {
            return res.status(400).json({
                message: "O prazo deve ser posterior ao início da tarefa."
            });
        }
        // Pontuação
        if (points < 1) {
            return res.status(400).json({
                message: "A pontuação da tarefa deve ser maior que zero."
            });
        }
        // Grupo
        const existingGroup = await Group.findById(group); 
        if (!existingGroup) {
            return res.status(404).json({
                message: "Grupo não encontrado."  
            });
        }
        // Verifica se o usuário pertence ao grupo
        const member = existingGroup.members.find(
            member => member.user.toString() === req.user.id
        );
        if (!member) {
            return res.status(403).json({
                message: "Você não faz parte deste grupo."
            });
        }
        // Apenas administradores podem criar tarefas
        if (member.role !== "admin") {
            return res.status(403).json({
                message: "Apenas administradores podem criar tarefas."
            });
        }
        // Criação da tarefa
        const task = await Task.create({
            title: title.trim(),
            description,
            points,
            group,
            createdBy: req.user.id,
            startsAt,
            deadline,
            isRecurring,
            recurrence
        });
        return res.status(201).json({
            message: "Tarefa criada com sucesso.",
            task
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }
};

// Listar tarefas dos grupos do usuário

const getMyTasks = async (req, res) => {
    try {

        // Busca todos os grupos em que o usuário participa
        const groups = await Group.find({
            "members.user": req.user.id
        }).select("_id");

        const groupIds = groups.map(group => group._id);

        // Data atual
        const now = new Date();

        // Busca apenas tarefas ativas
        const tasks = await Task.find({
            group: { $in: groupIds },
            startsAt: { $lte: now },
            deadline: { $gte: now }
        })
            .populate("group", "name")
            .populate("createdBy", "name")
            .sort({ deadline: 1 });

        return res.status(200).json({
            message: "Tarefas recuperadas com sucesso.",
            tasks
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Histórico de tarefas do usuário

const getTaskHistory = async (req, res) => {
    try {

        // Busca todos os grupos em que o usuário participa
        const groups = await Group.find({
            "members.user": req.user.id
        }).select("_id");

        const groupIds = groups.map(group => group._id);

        // Data atual
        const now = new Date();

        // Busca apenas tarefas encerradas
        const tasks = await Task.find({
            group: { $in: groupIds },
            deadline: { $lt: now }
        })
            .populate("group", "name")
            .populate("createdBy", "name")
            .sort({ deadline: -1 });

        return res.status(200).json({
            message: "Histórico de tarefas recuperado com sucesso.",
            tasks
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Listar tarefas de um grupo específico

const getGroupTasks = async (req, res) => {
    try {

        const { groupId } = req.params;

        // Busca o grupo
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                message: "Grupo não encontrado."
            });
        }

        // Verifica se o usuário pertence ao grupo
        const member = group.members.find(
            member => member.user.toString() === req.user.id
        );

        if (!member) {
            return res.status(403).json({
                message: "Você não faz parte deste grupo."
            });
        }

        // Busca as tarefas do grupo
        const tasks = await Task.find({
            group: groupId
        })
            .populate("group", "name")
            .populate("createdBy", "name")
            .sort({ deadline: 1 });

        return res.status(200).json({
            message: "Tarefas recuperadas com sucesso.",
            tasks
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Detalhes de uma tarefa

const getTaskById = async (req, res) => {
    try {

        const { id } = req.params;

        // Busca a tarefa
        const task = await Task.findById(id)
            .populate("group", "name")
            .populate("createdBy", "name");

        if (!task) {
            return res.status(404).json({
                message: "Tarefa não encontrada."
            });
        }

        // Busca o grupo da tarefa
        const group = await Group.findById(task.group);

        // Verifica se o usuário pertence ao grupo
        const member = group.members.find(
            member => member.user.toString() === req.user.id
        );

        if (!member) {
            return res.status(403).json({
                message: "Você não faz parte deste grupo."
            });
        }

        return res.status(200).json({
            message: "Tarefa recuperada com sucesso.",
            task
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Atualizar uma tarefa

const updateTask = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            title,
            description,
            points,
            startsAt,
            deadline
        } = req.body;

        if (
            req.body.isRecurring !== undefined ||
            req.body.recurrence !== undefined
        ) {
            return res.status(400).json({
                message: "A recorrência da tarefa não pode ser alterada após sua criação."
            });
        }

        // Busca a tarefa
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Tarefa não encontrada."
            });
        }

        // Busca o grupo da tarefa
        const group = await Group.findById(task.group);

        // Verifica se o usuário pertence ao grupo
        const member = group.members.find(
            member => member.user.toString() === req.user.id
        );

        if (!member) {
            return res.status(403).json({
                message: "Você não faz parte deste grupo."
            });
        }

        // Apenas administradores podem editar
        if (member.role !== "admin") {
            return res.status(403).json({
                message: "Apenas administradores podem editar tarefas."
            });
        }

        // Validação da pontuação
        if (points !== undefined && points < 1) {
            return res.status(400).json({
                message: "A pontuação da tarefa deve ser maior que zero."
            });
        }

        // Validação das datas
        const newStartsAt = startsAt !== undefined
            ? new Date(startsAt)
            : task.startsAt;

        const newDeadline = deadline !== undefined
            ? new Date(deadline)
            : task.deadline;

        if (newStartsAt >= newDeadline) {
            return res.status(400).json({
                message: "O prazo deve ser posterior ao início da tarefa."
            });
        }

        // Atualiza apenas os campos enviados
        if (title !== undefined) task.title = title.trim();
        if (description !== undefined) task.description = description;
        if (points !== undefined) task.points = points;
        if (startsAt !== undefined) task.startsAt = startsAt;
        if (deadline !== undefined) task.deadline = deadline;

        await task.save();

        return res.status(200).json({
            message: "Tarefa atualizada com sucesso.",
            task
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

// Excluir uma tarefa

const deleteTask = async (req, res) => {
    try {

        const { id } = req.params;

        // Busca a tarefa
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: "Tarefa não encontrada."
            });
        }

        // Busca o grupo da tarefa
        const group = await Group.findById(task.group);

        // Verifica se o usuário pertence ao grupo
        const member = group.members.find(
            member => member.user.toString() === req.user.id
        );

        if (!member) {
            return res.status(403).json({
                message: "Você não faz parte deste grupo."
            });
        }

        // Apenas administradores podem excluir
        if (member.role !== "admin") {
            return res.status(403).json({
                message: "Apenas administradores podem excluir tarefas."
            });
        }

        // TODO:
        // Verificar se existem TaskSubmissions vinculadas a esta tarefa.
        // Caso existam, impedir a exclusão.

        await Task.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Tarefa excluída com sucesso."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });

    }
};

module.exports = {
    createTask,
    getMyTasks,
    getTaskHistory,
    getGroupTasks,
    getTaskById,
    updateTask,
    deleteTask
};