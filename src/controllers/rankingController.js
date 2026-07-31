const Vote = require("../models/Vote");
const Task = require("../models/Task");
const Group = require("../models/Group");
const User = require("../models/User");

// POST /tasks/:id/contest - Abrir uma contestação
exports.contestTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { groupId } = req.body;

    // 1. Verificar se a tarefa existe
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada." });
    }

    // 2. Evitar que o próprio autor da foto conteste a si mesmo
    if (task.user && task.user.toString() === userId) {
      return res.status(400).json({ 
        message: "Você não pode contestar a sua própria tarefa." 
      });
    }

    // 3. Verificar se já existe uma contestação aberta para essa tarefa
    const existingVote = await Vote.findOne({ task: taskId, status: "PENDING" });
    if (existingVote) {
      return res.status(400).json({ 
        message: "Já existe uma contestação em andamento para esta tarefa." 
      });
    }

    // 4. Calcular o prazo de expiração (24 horas a partir de agora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 5. Criar e salvar o registro da contestação no banco
    const newContest = new Vote({
      task: taskId,
      contestant: userId,
      group: groupId,
      votes: [],
      status: "PENDING",
      expiresAt: expiresAt,
    });

    await newContest.save();

    return res.status(201).json({
      message: "Contestação iniciada com sucesso! A votação está aberta por 24 horas.",
      contest: newContest,
    });
  } catch (error) {
    console.error("Erro ao contestar tarefa:", error);
    return res.status(500).json({ 
      message: "Erro interno do servidor ao iniciar contestação.",
      error: error.message 
    });
  }
};

// POST /tasks/:id/vote - Votar em uma contestação aberta
exports.voteContest = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { choice } = req.body;

    // 1. Validar a opção de voto enviada
    if (!["INVALID", "VALID"].includes(choice)) {
      return res.status(400).json({ 
        message: "Opção de voto inválida. Use 'INVALID' ou 'VALID'." 
      });
    }

    // 2. Buscar a contestação pendente para essa tarefa
    const contest = await Vote.findOne({ task: taskId, status: "PENDING" }).populate("task");
    if (!contest) {
      return res.status(404).json({ 
        message: "Nenhuma contestação pendente encontrada para esta tarefa." 
      });
    }

    // 3. Impedir que o autor da foto vote na sua própria contestação
    if (contest.task && contest.task.user && contest.task.user.toString() === userId) {
      return res.status(403).json({ 
        message: "O autor da tarefa não pode votar na contestação." 
      });
    }

    // 4. Verificar se o usuário já votou nesta contestação
    const alreadyVoted = contest.votes.some(
      (v) => v.user.toString() === userId
    );
    if (alreadyVoted) {
      return res.status(400).json({ 
        message: "Você já registrou seu voto nesta contestação." 
      });
    }

    // 5. Registrar o novo voto
    contest.votes.push({
      user: userId,
      choice: choice,
      votedAt: new Date(),
    });

    // 6. Verificar se o prazo de 24 horas expirou
    const isExpired = new Date() > new Date(contest.expiresAt);

    const group = await Group.findById(contest.group);
    const totalMembers = group && group.members ? group.members.length : 0;
    
    // Verificar se todos votaram (menos o autor da tarefa)
    const allMembersVoted = totalMembers > 0 && contest.votes.length >= (totalMembers - 1);

    // 7. Encerramento da Votação
    if (allMembersVoted || isExpired) {
      const invalidVotes = contest.votes.filter((v) => v.choice === "INVALID").length;
      const validVotes = contest.votes.filter((v) => v.choice === "VALID").length;

      if (invalidVotes > validVotes) {
        contest.status = "APPROVED"; // Contestação aceita!

        const taskAuthor = await User.findById(contest.task.user);

        if (taskAuthor) {
          taskAuthor.score = Math.max(0, (taskAuthor.score || 0) - 2);
          await taskAuthor.save();
        }
      } else {
        contest.status = "REJECTED";
      }
    }

    await contest.save();

    return res.status(200).json({
      message: contest.status === "PENDING" 
        ? "Voto registrado com sucesso!" 
        : `Votação encerrada! Resultado da contestação: ${contest.status}`,
      contest,
    });
  } catch (error) {
    console.error("Erro ao registrar voto:", error);
    return res.status(500).json({ 
      message: "Erro interno do servidor ao registrar voto.",
      error: error.message 
    });
  }
};

// GET /groups/:id/ranking - Obter o ranking dos membros do grupo
exports.getGroupRanking = async (req, res) => {
  try {
    const groupId = req.params.id;

    // 1. Buscar o grupo e popular a lista de membros
    const group = await Group.findById(groupId).populate({
      path: "members",
      select: "name email score avatar",
    });

    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado." });
    }

    // 2. Ordenar os membros pela pontuação (do maior para o menor)
    const sortedMembers = group.members.sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      return scoreB - scoreA;
    });

    // 3. Estruturar a resposta com a posição no ranking
    const ranking = sortedMembers.map((member, index) => ({
      position: index + 1,
      user: {
        id: member._id,
        name: member.name,
        email: member.email,
        avatar: member.avatar || null,
        score: member.score || 0,
      },
    }));

    return res.status(200).json({
      groupName: group.name,
      totalMembers: ranking.length,
      ranking: ranking,
    });
  } catch (error) {
    console.error("Erro ao buscar ranking do grupo:", error);
    return res.status(500).json({
      message: "Erro interno do servidor ao gerar ranking.",
      error: error.message,
    });
  }
};