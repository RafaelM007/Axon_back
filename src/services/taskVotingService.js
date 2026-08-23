const { updateMemberPoints } = require("./groupPointsService");

const finishVoting = async (submission) => {

    if (submission.contest.resolved) {
        return submission;
    }

    const acceptedVotes = submission.votes.filter( 
        vote => vote.decision === "accepted"
    ).length;

    const invalidatedVotes = submission.votes.filter(
        vote => vote.decision === "invalidated"
    ).length;


    let finalDecision;

    if (acceptedVotes > invalidatedVotes) {
        finalDecision = "accepted";
    } else {
        // Maioria pela invalidação ou empate
        finalDecision = "invalidated";
    }


    submission.finalDecision = finalDecision;
    submission.status = finalDecision;
    submission.finishedAt = new Date();

    submission.contest.resolved = true;

    // Contestação aceita → autor perde os pontos da tarefa.
    if (finalDecision === "invalidated") {
        await updateMemberPoints(
            submission.task.group,
            submission.user,
            -submission.task.points
        );
    }

    // Contestação rejeitada → contestador perde o +1 recebido.
    if (finalDecision === "accepted") {
        await updateMemberPoints(
            submission.task.group,
            submission.contest.createdBy,
            -1
        );
    }



    await submission.save();

    return submission;
};


module.exports = {
    finishVoting
};