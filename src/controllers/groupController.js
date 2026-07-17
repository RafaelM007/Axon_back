const groupService = require("../services/groupService");

const createGroup = async (req, res) => {
  try {
    const newGroup = await groupService.createGroupService(
      req.body,
      req.user.id,
    );
    return res.status(201).json({
      success: true,
      message: "Grupo criado com sucesso!",
      group: newGroup,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erro ao criar o grupo.",
    });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { code, password } = req.body;
    const group = await groupService.joinGroupService(
      code,
      password,
      req.user.id,
    );
    return res.status(200).json({
      success: true,
      message: "Você entrou no grupo com sucesso!",
      group,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const getGroupDetails = async (req, res) => {
  try {
    const group = await groupService.getGroupDetailsService(req.params.id);
    return res.status(200).json({ success: true, group });
  } catch (error) {
    return res
      .status(error.statusCode || 404)
      .json({ success: false, message: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await groupService.deleteGroupService(id, userId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await groupService.leaveGroupService(id, userId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updatedGroup = await groupService.updateGroupService(
      id,
      userId,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Grupo atualizado com sucesso!",
      group: updatedGroup,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getGroupDetails,
  deleteGroup,
  leaveGroup,
  updateGroup,
};
