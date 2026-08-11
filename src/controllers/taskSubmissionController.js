const TaskSubmission = require("../models/TaskSubmission");
const Task = require("../models/Task");
const Group = require("../models/Group");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { finishVoting } = require("../services/taskVotingService");

// 1. Enviar evidência

const submitEvidence = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Nenhuma imagem foi enviada."
            });
        }

        const { task } = req.body;

        if (!task) {
            return res.status(400).json({
                message: "A tarefa é obrigatória."
            });
        }

        const taskData = await Task
            .findById(task)
            .populate("group");

        if (!taskData) {
            return res.status(404).json({
                message: "Tarefa não encontrada."
            });
        }

        if (!taskData.group) { 
            return res.status(404).json({
                message: "Grupo da tarefa não encontrado."
            });
        }

        // Verifica se o usuário pertence ao grupo
        const isMember = taskData.group.members.some( 
            member => member.user.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Você não pertence ao grupo desta tarefa."
            });
        }

        const now = new Date();

        // Verifica se a tarefa já começou
        if (now < taskData.startsAt) {
            return res.status(400).json({
                message: "A tarefa ainda não começou."
            });
        }

        // Verifica se o prazo terminou
        if (now >= taskData.deadline) {
            return res.status(400).json({
                message: "O prazo da tarefa já terminou."
            });
        }

        // Verifica se já existe uma submissão
        const existingSubmission = await TaskSubmission.findOne({
            task: taskData._id,
            user: req.user.id
        });

        if (existingSubmission) {
            return res.status(409).json({
                message: "Você já enviou uma evidência para esta tarefa."
            });
        }

        // Upload da imagem para o Cloudinary
        const result = await new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "axon/task-evidence"
                },
                (error, result) => {

                    if (error) {
                        return reject(error);
                    }

                    resolve(result);
                }
            );

            streamifier
                .createReadStream(req.file.buffer)
                .pipe(stream);
        });

        // Cria a submissão
        const submission = await TaskSubmission.create({
            task: taskData._id,
            user: req.user.id,
            evidence: {
                url: result.secure_url,
                publicId: result.public_id
            }
        });

        return res.status(201).json({
            message: "Evidência enviada com sucesso.",
            submission
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }
};


// 2. Buscar minhas evidências

const getMySubmissions = async (req, res) => {
    try {

        const submissions = await TaskSubmission.find({
            user: req.user.id
        })
            .populate("task", "title description points group startsAt deadline")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            submissions
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }
};


// 3. Buscar evidências pendentes para validação

const getPendingValidations = async (req, res) => {
    try {

        const groups = await Group.find({
            "members.user": req.user.id
        }).select("_id");

        const groupIds = groups.map(group => group._id);

        const submissions = await TaskSubmission.find({
            // Não pode ser a própria evidência
            user: { $ne: req.user.id },

            // A evidência ainda está na etapa de validação inicial
            status: "accepted",

            // O usuário ainda não tomou uma decisão sobre ela
            initialValidations: {
                $not: {
                    $elemMatch: {
                        user: req.user.id
                    }
                }
            }
        })
            .populate({
                path: "task",
                match: {
                    group: { $in: groupIds },
                    deadline: { $gt: new Date() }
                },
                select: "title description points group startsAt deadline",
                populate: {
                    path: "group",
                    select: "name"
                }
            })
            .populate("user", "name profileImage")
            .sort({ createdAt: -1 });

        const pendingSubmissions = submissions.filter(
            submission => submission.task !== null
        );

        return res.status(200).json({
            submissions: pendingSubmissions
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }
};


// 4. Detalhes de uma evidência

const getSubmissionById = async (req, res) => {
    try {

        const { id } = req.params;

        const submission = await TaskSubmission.findById(id)
            .populate("user", "name profileImage")
            .populate({
                path: "task",
                select: "title description points group startsAt deadline",
                populate: {
                    path: "group",
                    select: "name members"
                }
            });

        if (!submission) {
            return res.status(404).json({
                message: "Evidência não encontrada."
            });
        }

        if (!submission.task || !submission.task.group) {
            return res.status(404).json({
                message: "Tarefa ou grupo da evidência não encontrado."
            });
        }

        // Verifica se o usuário pertence ao grupo da tarefa
        const isMember = submission.task.group.members.some(
            member => member.user.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Você não tem acesso a esta evidência."
            });
        }

        return res.status(200).json({
            submission
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }
};


// 5. Primeira validação: aprovar ou contestar

const validateSubmission = async (req, res) => {
    try {

        const { id } = req.params;
        const { action, reason } = req.body;

        // Valida a ação
        if (!action) {
            return res.status(400).json({
                message: "A decisão é obrigatória."
            });
        }

        if (!["approved", "contested"].includes(action)) {
            return res.status(400).json({
                message: "Decisão inválida. Use approved ou contested."
            });
        }

        // Contestação precisa possuir motivo
        if (action === "contested" && !reason?.trim()) {
            return res.status(400).json({
                message: "O motivo da contestação é obrigatório."
            });
        }

        const submission = await TaskSubmission.findById(id)
            .populate({
                path: "task",
                select: "group deadline"
            });

        if (!submission) {
            return res.status(404).json({
                message: "Evidência não encontrada."
            });
        }

        if (!submission.task) {
            return res.status(404).json({
                message: "Tarefa da evidência não encontrada."
            });
        }
        const now = new Date();

        if (now >= submission.task.deadline) {
            return res.status(400).json({
                message: "O prazo da tarefa já terminou. A evidência não pode mais ser validada."
            });
        }

        // Só pode validar evidências ainda na validação inicial
        if (submission.status !== "accepted") {
            return res.status(400).json({
                message: "Esta evidência não está disponível para validação."
            });
        }

        // O autor da evidência não pode validá-la
        if (submission.user.toString() === req.user.id) {
            return res.status(403).json({
                message: "Você não pode validar sua própria evidência."
            });
        }

        // Verifica se o usuário pertence ao grupo
        const group = await Group.findById(submission.task.group);

        if (!group) {
            return res.status(404).json({
                message: "Grupo da tarefa não encontrado."
            });
        }

        const isMember = group.members.some(
            member => member.user.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Você não pertence ao grupo desta tarefa."
            });
        }

        // Verifica se o usuário já tomou uma decisão
        const alreadyValidated = submission.initialValidations.some(
            validation => validation.user.toString() === req.user.id
        );

        if (alreadyValidated) {
            return res.status(409).json({
                message: "Você já realizou uma validação para esta evidência."
            });
        }

        // Registra a decisão inicial
        submission.initialValidations.push({
            user: req.user.id,
            action
        });

        // Se houver contestação, inicia a votação
        if (action === "contested") {

            submission.status = "voting";

            submission.contest = {
                reason: reason.trim(),
                createdBy: req.user.id,
                createdAt: new Date(),
                resolved: false
            };
        }

        await submission.save();

        return res.status(200).json({
            message:
                action === "approved"
                    ? "Evidência aprovada com sucesso."
                    : "Evidência contestada. Uma votação foi iniciada.",

            submission
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }
};

// 6. Votar em uma contestação
const voteSubmission = async (req, res) => {
    try {

        const { id } = req.params;
        const { decision } = req.body;

        // Valida a decisão
        if (!decision) {
            return res.status(400).json({
                message: "A decisão é obrigatória."
            });
        }

        if (!["accepted", "invalidated"].includes(decision)) {
            return res.status(400).json({
                message: "Decisão inválida. Use accepted ou invalidated."
            });
        }

        const submission = await TaskSubmission.findById(id)
            .populate({
                path: "task",
                select: "group deadline"
            });

        if (!submission) {
            return res.status(404).json({
                message: "Evidência não encontrada."
            });
        }

        if (!submission.task) {
            return res.status(404).json({
                message: "Tarefa da evidência não encontrada."
            });
        }

        // A votação precisa estar aberta
        if (submission.status !== "voting") {
            return res.status(400).json({
                message: "Esta evidência não está em votação."
            });
        }

        // O autor da evidência não pode votar
        if (submission.user.toString() === req.user.id) {
            return res.status(403).json({
                message: "Você não pode votar na própria evidência."
            });
        }

        // Quem abriu a contestação não pode votar
        if (
            submission.contest &&
            submission.contest.createdBy &&
            submission.contest.createdBy.toString() === req.user.id
        ) {
            return res.status(403).json({
                message: "Quem contestou a evidência não pode votar."
            });
        }

        // Busca o grupo
        const group = await Group.findById(submission.task.group);

        if (!group) {
            return res.status(404).json({
                message: "Grupo da tarefa não encontrado."
            });
        }

        // Verifica se o usuário pertence ao grupo
        const isMember = group.members.some(
            member => member.user.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Você não pertence ao grupo desta tarefa."
            });
        }

        // Verifica se já votou
        const alreadyVoted = submission.votes.some(
            vote => vote.user.toString() === req.user.id
        );

        if (alreadyVoted) {
            return res.status(409).json({
                message: "Você já votou nesta evidência."
            });
        }

        // Registra o voto
        submission.votes.push({
            user: req.user.id,
            decision
        });

        // Usuários que podem participar da votação
        const eligibleVoters = group.members.filter(
            member =>
                member.user.toString() !== submission.user.toString() &&
                member.user.toString() !== submission.contest.createdBy.toString()
        );

        const totalEligibleVoters = eligibleVoters.length;
        const totalVotes = submission.votes.length;

        // Verifica se todos os elegíveis já votaram
        const everyoneVoted =
            totalVotes >= totalEligibleVoters;

        // Verifica se o prazo da tarefa já terminou
        const deadlineReached =
            new Date() >= submission.task.deadline;

        // A votação termina se:
        // 1. todos votaram
        // OU
        // 2. o prazo terminou
        if (everyoneVoted || deadlineReached) {

            await finishVoting(submission);

            return res.status(200).json({
                message: "Votação finalizada com sucesso.",
                finalDecision: submission.finalDecision,
                submission
            });
        }

        // Ainda existem votos pendentes
        await submission.save();

        return res.status(200).json({
            message: "Voto registrado com sucesso.",
            submission
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }

};



module.exports = {
    submitEvidence,
    getMySubmissions,
    getPendingValidations,
    getSubmissionById,
    validateSubmission,
    voteSubmission
};