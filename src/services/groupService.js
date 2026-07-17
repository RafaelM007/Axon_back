const Group = require("../models/Group");

// Função auxiliar para gerar o código aleatório do grupo
const generateGroupCode = () => {
  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `AXON-${numbers}`;
};

exports.createGroupService = async (groupData, creatorId) => {
  let code = generateGroupCode();
  let codeExists = await Group.findOne({ code });
  while (codeExists) {
    code = generateGroupCode();
    codeExists = await Group.findOne({ code });
  }

  return await Group.create({
    ...groupData,
    code,
    creator: creatorId,
    members: [creatorId],
  });
};

exports.joinGroupService = async (code, password, userId) => {
  const group = await Group.findOne({ code }).select("+password");

  if (!group) throw new Error("Grupo não encontrado com esse código.");
  if (group.members.includes(userId))
    throw new Error("Você já é um membro deste grupo.");
  if (group.members.length >= group.maxMembers)
    throw new Error("Este grupo já está cheio.");
  if (group.password && group.password !== password)
    throw new Error("Senha do grupo incorreta.");

  group.members.push(userId);
  await group.save();
  return group;
};

exports.getGroupDetailsService = async (id) => {
  const group = await Group.findById(id)
    .populate("members", "name email")
    .populate("creator", "name");

  if (!group) throw new Error("Grupo não encontrado.");
  return group;
};
