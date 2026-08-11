const finishVoting = async (submission) => {

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


    await submission.save();

    return submission;
};


module.exports = {
    finishVoting
};