const Group = require("../models/Group");

const getGroupRanking = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId)
            .populate("members.user", "name email profileImage");

        if (!group) {
            return res.status(404).json({
                message: "Grupo não encontrado."
            });
        }

        const isMember = group.members.some(
            member => member.user._id.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Você não pertence a este grupo."
            });
        }

        const ranking = [...group.members]
            .sort((a, b) => {
                if (b.points !== a.points) {
                    return b.points - a.points;
                }

                return a.pointsUpdatedAt - b.pointsUpdatedAt;
            })
            .map((member, index) => ({
                position: index + 1,
                user: {
                    id: member.user._id,
                    name: member.user.name,
                    email: member.user.email,
                    profileImage: member.user.profileImage || null
                },
                points: member.points
            }));

        return res.status(200).json({
            group: {
                id: group._id,
                name: group.name
            },
            totalMembers: ranking.length,
            ranking
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }
};

module.exports = {
    getGroupRanking
};