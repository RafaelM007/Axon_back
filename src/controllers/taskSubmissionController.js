const TaskSubmission = require("../models/TaskSubmission");
const Task = require("../models/Task");
const Group = require("../models/Group");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Usuário envia evidência
const submitTask = async (req, res) => {
    const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "ID da tarefa inválido.",
      });
    }

    const userId = req.user.id || req.user._id;

    // Busca a tarefa
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    // Busca o grupo
    const group = await Group.findById(task.group);

    if (!group) {
      return res.status(404).json({
        message: "Grupo não encontrado.",
      });
    }

    // Verifica se o usuário pertence ao grupo
    const member = group.members.find(
      (member) => member.user.toString() === userId.toString()
    );

    if (!member) {
      return res.status(403).json({
        message: "Você não pertence a este grupo.",
      });
    }

    // Verifica se já enviou evidência anteriormente
    const alreadySubmitted = await TaskSubmission.findOne({
      task: taskId,
      user: userId,
    });

    if (alreadySubmitted) {
      return res.status(400).json({
        message: "Você já enviou uma evidência para esta tarefa.",
      });
    }

    // Verifica se foi enviada uma imagem
    if (!req.file) {
      return res.status(400).json({
        message: "É necessário enviar uma imagem como evidência.",
      });
    }

    // Cria a submissão
    const submission = await TaskSubmission.create({
      task: task._id,
      user: userId,
      status: "Aceita",
      evidence: {
        url: req.file.path || req.file.secure_url,
        publicId: req.file.filename || req.file.public_id,
      },
      submittedAt: new Date(),
    });

    // Soma os pontos ao membro
    member.points = (member.points || 0) + task.points;

    group.markModified("members");

    await group.save();

    return res.status(201).json({
      success: true,
      message: "Evidência enviada com sucesso.",
      submission,
    });
    } catch (error) {
        return res.status(500).json({
        success: false,
        message: error.message,
        });
    }
    };
}

// Usuário consulta sua submissão
const getMySubmission = async (req, res) => {
    const getMySubmission = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "ID da tarefa inválido.",
      });
    }

    const userId = req.user.id || req.user._id;

    const submission = await TaskSubmission.findOne({
      task: taskId,
      user: userId,
    });

    if (!submission) {
      return res.status(404).json({
        message: "Nenhuma submissão encontrada.",
      });
    }

    return res.status(200).json(submission);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
}

// Administrador lista todas as submissões de uma tarefa
const getTaskSubmissions = async (req, res) => {const getTaskSubmissions = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "ID da tarefa inválido.",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    const submissions = await TaskSubmission.find({
      task: taskId,
    }).populate("user", "name email profileImage");

    return res.status(200).json(submissions);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};}

// Usuário altera a própria evidência
const updateSubmission = async (req, res) => {
    // 3. Enviar evidência da tarefa (updateTask)
const updateTask = async (req, res) => {
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

    // Verifica se o usuário pertence ao grupo
    const group = await Group.findOne({
      _id: task.group,
      $or: [
        { creator: userId },
        { "members.user": userId }
      ]
    });

    if (!group) {
      return res.status(403).json({
        message: "Você não pertence a este grupo.",
      });
    }

    // Procura a submissão desse usuário
    let submission = task.submissions.find(
      (s) => s.user.toString() === userId.toString()
    );

    // Só pode enviar uma vez
    if (submission) {
      return res.status(400).json({
        message: "Você já enviou a evidência desta tarefa.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Envie uma imagem de evidência.",
      });
    }

    task.submissions.push({
      user: userId,
      evidence: {
        url: req.file.path || req.file.secure_url,
        publicId: req.file.filename || req.file.public_id,
        submittedAt: new Date(),
      },
      status: "Concluída",
      completed: true,
    });

    await task.save();

    return res.status(200).json({
      message: "Evidência enviada com sucesso.",
      task,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
}

// Usuário remove a submissão
const deleteSubmission = async (req, res) => {
    const deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!isValidObjectId(submissionId)) {
      return res.status(400).json({
        message: "ID da submissão inválido.",
      });
    }

    const submission = await TaskSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        message: "Submissão não encontrada.",
      });
    }

    if (submission.evidence.publicId) {
      await cloudinary.uploader.destroy(submission.evidence.publicId);
    }

    await submission.deleteOne();

    return res.status(200).json({
      message: "Submissão removida com sucesso.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
}

module.exports = {
    submitTask,
    getMySubmission,
    getTaskSubmissions,
    updateSubmission,
    deleteSubmission
};