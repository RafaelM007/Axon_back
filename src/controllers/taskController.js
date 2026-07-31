const mongoose = require("mongoose");
const Task = require("../models/Task");
const Group = require("../models/Group");

// Helper para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. Criar tarefa
const createTask = async (req, res) => {
  try {

    const { title, description, group, points, deadline } = req.body;

    if (points !== undefined && isNaN(Number(points))) {
      return res.status(400).json({
        message: "Pontuação inválida.",
      });
    }

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
      description,
      group,
      points: points !== undefined ? Number(points) : 10,
      deadline: deadline || null,
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

    const queryFilter = {};

    if (groupId) {

        if (!isValidObjectId(groupId)) {
            return res.status(400).json({
                message: "ID de grupo inválido."
            });
        }

        const groupExists = await Group.findOne({
            _id: groupId,
            $or: [
                { creator: userId },
                { "members.user": userId }
            ]
        });

        if (!groupExists) {
            return res.status(403).json({
                message: "Você não pertence a este grupo."
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

// 3. Atualizar dados gerais da tarefa (com suporte a Foto)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de tarefa inválido.",
      });
    }

    const userId = req.user.id || req.user._id;
    const { title, description, deadline, points } = req.body;

    if (points !== undefined && isNaN(Number(points))) {
      return res.status(400).json({
        message: "Pontuação inválida.",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    const group = await Group.findById(task.group);

    if (!group) {
        return res.status(404).json({
            message: "Grupo não encontrado."
        });
    }

    if (group.creator.toString() !== userId.toString()) {
        return res.status(403).json({
            message: "Somente o administrador do grupo pode editar tarefas."
        });
    }

    if (title) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (deadline !== undefined) {
      task.deadline = deadline;
    }

    if (points !== undefined) {
      task.points = Number(points);
    }

    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// 4. Excluir tarefa (e apagar imagem do Cloudinary se existir)
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

    const group = await Group.findById(task.group);

    if (!group) {
        return res.status(404).json({
            message: "Grupo não encontrado."
        });
    }

    if (group.creator.toString() !== userId.toString()) {
        return res.status(403).json({
            message: "Somente o administrador pode excluir tarefas."
        });
    } 

    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Tarefa excluída com sucesso.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Listar todas as submissões de uma tarefa
const getTaskSubmissions = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID de tarefa inválido.",
      });
    }

    const userId = req.user.id || req.user._id;

    const task = await Task.findById(id)
      .populate("submissions.user", "name email profileImage");

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    // Verifica se o usuário pertence ao grupo
    const group = await Group.findOne({
      _id: task.group,
      $or: [
        { creator: userId },
        { "members.user": userId },
      ],
    });

    if (!group) {
      return res.status(403).json({
        message: "Você não pertence a este grupo.",
      });
    }

    return res.status(200).json({
      taskId: task._id,
      title: task.title,
      submissions: task.submissions,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
