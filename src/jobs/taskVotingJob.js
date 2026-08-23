const cron = require("node-cron");

const TaskSubmission = require("../models/TaskSubmission");

const { finishVoting } = require("../services/taskVotingService");
const taskVotingJob = cron.schedule(
    "* * * * *",
    async () => {

        try {

            const now = new Date();

            const submissions = await TaskSubmission.find({
                status: "voting",
                "contest.resolved": false
            }).populate({
                path: "task",
                select: "deadline"
            });

            for (const submission of submissions) {

                if (!submission.task) {
                    continue;
                }

                if (now >= submission.task.deadline) {

                    await finishVoting(submission);

                    console.log(
                        `Votação finalizada automaticamente: ${submission._id}`
                    );
                }
            }

        } catch (error) {

            console.error(
                "Erro ao processar votações vencidas:",
                error
            );
        }

    },
    {
        timezone: "America/Sao_Paulo"
    }
);