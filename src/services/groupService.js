const Group = require("../models/Group");
const bcrypt = require("bcrypt");

// 1. CRIAR GRUPO (Mantendo sua lógica original, mas exportada certinho)
const createGroupService = async (groupData, userId) => {
  // Lógica que você já tinha implementado para criar o grupo...
  // (Gera o código AXON-XXXX, define o creator e insere nos members)
};

// 2. BUSCAR DETALHES (Sua lógica original com populate)
const getGroupDetailsService = async (groupId) => {
  const group = await Group.findById(groupId)
    .populate("members", "name email")
    .populate("creator", "name email");
  if (!group) {
    const error = new Error("Grupo não encontrado.");
    error.statusCode = 404;
    throw error;
  }
  return group;
};

// 3. ENTRAR NO GRUPO (Perfeito, igual você mandou)
const joinGroupService = async (code, password, userId) => {
  const group = await Group.findOne({ code }).select("+password");

  if (!group) {
    const error = new Error("Grupo não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, group.password);
  if (!isMatch) {
    const error = new Error("Senha do grupo incorreta.");
    error.statusCode = 401;
    throw error;
  }

  if (group.members.includes(userId)) {
    const error = new Error("Você já faz parte deste grupo.");
    error.statusCode = 400;
    throw error;
  }

  if (group.members.length >= group.maxMembers) {
    const error = new Error(
      "Este grupo já atingiu o limite máximo de membros.",
    );
    error.statusCode = 400;
    throw error;
  }

  group.members.push(userId);
  await group.save();
  return group;
};

// 4. EXCLUIR GRUPO (Perfeito, igual você mandou)
const deleteGroupService = async (groupId, userId) => {
  const group = await Group.findById(groupId);

  if (!group) {
    const error = new Error("Grupo não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  if (group.creator.toString() !== userId.toString()) {
    const error = new Error(
      "Apenas o administrador/criador do grupo pode excluí-lo.",
    );
    error.statusCode = 403;
    throw error;
  }

  await Group.findByIdAndDelete(groupId);
  return { message: "Grupo excluído com sucesso." };
};

// 5. NOVA: SAIR DO GRUPO (Regra: O criador não pode simplesmente sair, tem que excluir)
const leaveGroupService = async (groupId, userId) => {
  const group = await Group.findById(groupId);

  if (!group) {
    const error = new Error("Grupo não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  if (group.creator.toString() === userId.toString()) {
    const error = new Error(
      "O criador não pode sair do grupo. Você deve excluir o grupo ou transferir a liderança.",
    );
    error.statusCode = 400;
    throw error;
  }

  if (!group.members.includes(userId)) {
    const error = new Error("Você não faz parte deste grupo.");
    error.statusCode = 400;
    throw error;
  }

  // Remove o ID do usuário do array de membros
  group.members = group.members.filter(
    (memberId) => memberId.toString() !== userId.toString(),
  );
  await group.save();
  return { message: "Você saiu do grupo com sucesso." };
};

// 6. NOVA: EDITAR GRUPO (Apenas o Admin pode alterar nome/descrição)
const updateGroupService = async (groupId, userId, updateData) => {
  const group = await Group.findById(groupId);

  if (!group) {
    const error = new Error("Grupo não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  if (group.creator.toString() !== userId.toString()) {
    const error = new Error(
      "Apenas o administrador pode editar as informações do grupo.",
    );
    error.statusCode = 403;
    throw error;
  }

  // Atualiza apenas os campos permitidos (nome e descrição)
  if (updateData.name) group.name = updateData.name;
  if (updateData.description) group.description = updateData.description;

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
