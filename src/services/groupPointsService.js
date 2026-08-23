const Group = require("../models/Group");

const updateMemberPoints = async (groupId, userId, amount) => {
    const group = await Group.findById(groupId);

    if (!group) {
        throw new Error("Grupo não encontrado.");
    }

    const member = group.members.find(
        member => member.user.toString() === userId.toString()
    );

    if (!member) {
        throw new Error("Usuário não pertence ao grupo.");
    }

    member.points = Math.max(0, member.points + amount);
    member.pointsUpdatedAt = new Date();

    await group.save();

    return member;
};

module.exports = {
    updateMemberPoints
};