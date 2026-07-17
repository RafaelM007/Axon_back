const groupService = require("../services/groupService");

exports.createGroup = async (req, res) => {
  try {
    const newGroup = await groupService.createGroupService(
      req.body,
      req.user.id,
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Grupo criado com sucesso!",
        group: newGroup,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Erro ao criar o grupo.",
      });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const { code, password } = req.body;
    const group = await groupService.joinGroupService(
      code,
      password,
      req.user.id,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Você entrou no grupo com sucesso!",
        group,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getGroupDetails = async (req, res) => {
  try {
    const group = await groupService.getGroupDetailsService(req.params.id);
    res.status(200).json({ success: true, group });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};
