const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "O nome é obrigatório."],
            trim: true,
            minlength: [3, "O nome deve ter no mínimo 3 caracteres."],
            maxlength: [100, "O nome deve ter no máximo 100 caracteres."]
        },

        email: {
            type: String,
            required: [true, "O e-mail é obrigatório."],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\S+@\S+\.\S+$/,
                "Informe um e-mail válido."
            ]
        },

        birthDate: {
            type: Date,
            required: [true, "A data de nascimento é obrigatória."]
        },

        phone: {
            type: String,
            required: [true, "O telefone é obrigatório."],
            trim: true,
            match: [
                /^\+?[0-9()\-\s]{10,20}$/,
                "Informe um telefone válido."
            ]
        },

        password: {
            type: String,
            required: [true, "A senha é obrigatória."],
            minlength: [6, "A senha deve ter no mínimo 6 caracteres."],
            select: false
        },

        profileImage: {
            type: String,
            default: ""
        },

        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);