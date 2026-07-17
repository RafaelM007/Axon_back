const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "O nome do grupo é obrigatório."],
      trim: true,
      minlength: [3, "O nome deve ter no mínimo 3 caracteres."],
      maxlength: [50, "O nome deve ter no máximo 50 caracteres."],
    },
    description: {
      type: String,
      required: [true, "A descrição é obrigatória."],
      trim: true,
      maxlength: [300, "A descrição deve ter no máximo 300 caracteres."],
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: "",
      select: false, // Não traz a senha por padrão nas buscas comuns
    },
    maxMembers: {
      type: Number,
      required: [true, "A quantidade máxima de membros é obrigatória."],
      min: [2, "O grupo deve permitir pelo menos 2 membros."],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Group", groupSchema);
