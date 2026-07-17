const Group = require("../models/Group");
const bcrypt = require("bcrypt");

// 1. CRIAR GRUPO
const createGroupService = async (groupData, userId) => {
  if (!groupData.name || groupData.name.trim() === "") {
    throw new Error("O nome do grupo é obrigatório.");
  }

  const code =
    groupData.code || `AXON-${Math.floor(1000 + Math.random() * 9000)}`;

  // NÃO faz hash aqui.
  // O Model Group já faz isso automaticamente.

  const newGroup = await Group.create({
    ...groupData,
    code,
    creator: userId,
    members: [userId],
  });

  return newGroup;
};

// 2. BUSCAR DETALHES
const getGroupDetailsService = async (groupId, userId) => {
  const group = await Group.findById(groupId)
    .populate("members", "name email")
    .populate("creator", "name email");

  if (!group) {
    throw new Error("Grupo não encontrado.");
  }

  const isMember = group.members.some(
    (member) => member._id.toString() === userId.toString(),
  );

  if (!isMember) {
    const error = new Error("Acesso negado: Você não participa deste grupo.");
    error.statusCode = 403;
    throw error;
  }

  return group;
};

// 3. ENTRAR NO GRUPO
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
    (member) => member.toString() === userId.toString(),
  );

  if (alreadyMember) {
    throw new Error("Você já faz parte deste grupo.");
  }

  if (group.members.length >= group.maxMembers) {
    throw new Error("Grupo lotado.");
  }

  group.members.push(userId);

  await group.save();

  return group;
};

// 4. EXCLUIR GRUPO
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

// 5. SAIR DO GRUPO
const leaveGroupService = async (groupId, userId) => {
  const group = await Group.findById(groupId);

  if (!group) {
    throw new Error("Grupo não encontrado.");
  }

  if (group.creator.toString() === userId.toString()) {
    throw new Error("O criador não pode sair do grupo.");
  }

  group.members = group.members.filter(
    (member) => member.toString() !== userId.toString(),
  );

  await group.save();

  return {
    message: "Você saiu do grupo com sucesso.",
  };
};

// 6. EDITAR GRUPO
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
