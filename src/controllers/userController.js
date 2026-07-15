const User = require("../models/User");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Preencha todos os campos." });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ error: "Email já cadastrado." });
        }

        const user = await User.create({ name, email, password });

        return res.status(201).json({
            message: "Usuário criado com sucesso.",
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao criar usuário." });
    }
};

module.exports = { registerUser };