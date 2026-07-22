const mongoose = require("mongoose");
const Task = require("../models/Task");
const Group = require("../models/Group");

// Helper para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. Criar tarefa
const createTask = async (req, res) => {
  try {
    const { title, group, points } = req.body;

    if (!title || !group) {
      return res.status(400).json({
        message: "O título e o grupo da tarefa são obrigatórios.",
      });
    }

    if (!isValidObjectId(group)) {
      return res.status(400).json({
        message: "ID de grupo inválido.",
      });
    }

    const userId = req.user.id || req.user._id;

    const groupExists = await Group.findOne({
      _id: group,
      $or: [{ creator: userId }, { "members.user": userId }],
    });

    if (!groupExists) {
      return res.status(403).json({
        message:
          "Acesso negado. Você precisa ser membro deste grupo para criar tarefas nele.",
      });
    }

    const task = await Task.create({
      title,
      group,
      user: userId,
      points: points !== undefined ? points : 10,
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// 2. Listar tarefas do usuário
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { groupId } = req.query;

    const queryFilter = { user: userId };

    if (groupId) {
      if (!isValidObjectId(groupId)) {
        return res.status(400).json({
          message: "ID de grupo inválido.",
        });
      }
      queryFilter.group = groupId;
    }

    const tasks = await Task.find(queryFilter);

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// 3. Atualizar dados gerais da tarefa
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de tarefa inválido.",
      });
    }

    const userId = req.user.id || req.user._id;
    const { title } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    if (task.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message:
          "Acesso negado. Você só pode alterar tarefas de sua autoria.",
      });
    }

    if (title) {
      task.title = title;
    }

    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// 4. Excluir tarefa
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de tarefa inválido.",
      });
    }

    const userId = req.user.id || req.user._id;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    if (task.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message:
          "Acesso negado. Você só pode excluir tarefas de sua autoria.",
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      message: "Tarefa excluída com sucesso.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// 5. Atualizar status e atribuir/remover pontuação no Grupo
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de tarefa inválido.",
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "O status é obrigatório.",
      });
    }

    const userId = req.user.id || req.user._id;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    if (task.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message:
          "Acesso negado. Você não tem permissão para alterar esta tarefa.",
      });
    }

    const previousStatus = task.status;
    task.status = status;
    task.completed = status === "Concluída";

    await task.save();

    const taskPoints = Number(task.points) || 10;

    // 🔥 ATUALIZAÇÃO SEGURA DA PONTUAÇÃO DO MEMBRO NO GRUPO
    if (task.group) {
      const group = await Group.findById(task.group);

      if (group) {
        // Encontra o membro no array 'members' comparando os IDs
        const member = group.members.find(
          (m) => m.user && m.user.toString() === userId.toString()
        );

        if (member) {
          if (status === "Concluída" && previousStatus !== "Concluída") {
            member.points = (member.points || 0) + taskPoints;
          } else if (previousStatus === "Concluída" && status !== "Concluída") {
            member.points = Math.max(0, (member.points || 0) - taskPoints);
          }

          // Avisa o Mongoose que o array interno de objetos mudou e salva
          group.markModified("members");
          await group.save();
        }
      }
    }

    return res.status(200).json(task);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  updateStatus,
};