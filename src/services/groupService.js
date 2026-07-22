const Group = require("../models/Group");
const bcrypt = require("bcrypt");


const createGroupService = async (groupData, userId) => {
  if (!groupData.name || groupData.name.trim() === "") {
    throw new Error("O nome do grupo é obrigatório.");
  }

  const code =
    groupData.code || `AXON-${Math.floor(1000 + Math.random() * 9000)}`;

  
  const newGroup = await Group.create({
    ...groupData,
    code,
    creator: userId,
    members: [{ user: userId, points: 0 }],
  });

  return newGroup;
};


const getGroupDetailsService = async (groupId, userId) => {
  
  const group = await Group.findById(groupId)
    .populate("members.user", "name email profileImage")
    .populate("creator", "name email");

  if (!group) {
    throw new Error("Grupo não encontrado.");
  }

  
  const isMember = group.members.some(
    (member) => member.user && member.user._id.toString() === userId.toString()
  );

  if (!isMember) {
    const error = new Error("Acesso negado: Você não participa deste grupo.");
    error.statusCode = 403;
    throw error;
  }

  return group;
};


const joinGroupService = async (code, password, userId) => {
  const group = await Group.findOne({ code }).select("+password");

  if (!group) {
    throw new Error("Grupo não encontrado.");
  }

  if (group.password) {
    const isMatch = await bcrypt.compare(password, group.password);

    if (!isMatch) {
      throw new Error("Senha incorreta.");
    }
  }

  
  const alreadyMember = group.members.some(
    (member) => member.user && member.user.toString() === userId.toString()
  );

  if (alreadyMember) {
    throw new Error("Você já faz parte deste grupo.");
  }

  if (group.members.length >= group.maxMembers) {
    throw new Error("Grupo lotado.");
  }

  
  group.members.push({ user: userId, points: 0 });

  await group.save();

  return group;
};


const deleteGroupService = async (groupId, userId) => {
  const group = await Group.findById(groupId);

  if (!group) {
    throw new Error("Grupo não encontrado.");
  }

  if (group.creator.toString() !== userId.toString()) {
    throw new Error("Apenas o criador pode excluir o grupo.");
  }

  await Group.findByIdAndDelete(groupId);

  return {
    message: "Grupo excluído com sucesso.",
  };
};


const leaveGroupService = async (groupId, userId) => {
  const group = await Group.findById(groupId);

  if (!group) {
    throw new Error("Grupo não encontrado.");
  }

  if (group.creator.toString() === userId.toString()) {
    throw new Error("O criador não pode sair do grupo.");
  }

  // Filtra comparando a propriedade member.user
  group.members = group.members.filter(
    (member) => member.user && member.user.toString() !== userId.toString()
  );

  await group.save();

  return {
    message: "Você saiu do grupo com sucesso.",
  };
};


const updateGroupService = async (groupId, userId, updateData) => {
  if (updateData.name && updateData.name.trim() === "") {
    throw new Error("Nome inválido.");
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new Error("Grupo não encontrado.");
  }

  if (group.creator.toString() !== userId.toString()) {
    throw new Error("Apenas o criador pode editar o grupo.");
  }

  if (updateData.name) {
    group.name = updateData.name;
  }

  if (updateData.description) {
    group.description = updateData.description;
  }

  if (updateData.maxMembers) {
    group.maxMembers = updateData.maxMembers;
  }

  await group.save();

  return group;
};

module.exports = {
  createGroupService,
  getGroupDetailsService,
  joinGroupService,
  deleteGroupService,
  leaveGroupService,
  updateGroupService,
};