const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userController = {

    async register(req, res) {
        try {
            const { name, email, birthDate, phone, password } = req.body;

            if (!name || !email || !birthDate || !phone || !password) {
                return res.status(400).json({
                    message: "Todos os campos são obrigatórios."
                });
            }

            const existingUser = await User.findOne({ email });


            if (existingUser) {
                return res.status(409).json({
                    message: "Este e-mail já está cadastrado."
                });
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                name,
                email,
                birthDate,
                phone,
                password: hashedPassword
            });

            return res.status(201).json({
                message: "Usuário cadastrado com sucesso.",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {
            console.error(error);

            if (error.name === "ValidationError") {
                return res.status(400).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: "Erro interno do servidor."
            });
        }
    },


    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: "E-mail e senha são obrigatórios."
                });
            }

            const user = await User.findOne({ email }).select("+password");

            if (!user) {
                return res.status(401).json({
                    message: "E-mail ou senha inválidos."
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({
                    message: "E-mail ou senha inválidos."
                });
            }
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );
            return res.status(200).json({
                message: "Login realizado com sucesso.",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                    isVerified: user.isVerified
                }
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro interno do servidor."
            });
        }
    },


    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    message: "Usuário não encontrado."
                });
            }

            return res.status(200).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    birthDate: user.birthDate,
                    phone: user.phone,
                    profileImage: user.profileImage,
                    isVerified: user.isVerified
                }
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro interno do servidor."
            });
        }
    },

    async updateProfile(req, res) {
        try {
            const { name, phone, birthDate } = req.body;

            const updateData = {};

            if (name) updateData.name = name;
            if (phone) updateData.phone = phone;
            if (birthDate) updateData.birthDate = birthDate;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    message: "Nenhum dado foi enviado para atualização."
                });
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!updatedUser) {
                return res.status(404).json({
                    message: "Usuário não encontrado."
                });
            }

            return res.status(200).json({
                message: "Perfil atualizado com sucesso.",
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    birthDate: updatedUser.birthDate,
                    phone: updatedUser.phone,
                    profileImage: updatedUser.profileImage,
                    isVerified: updatedUser.isVerified
                }
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro interno do servidor."
            });
        }
    }
};

module.exports = userController;