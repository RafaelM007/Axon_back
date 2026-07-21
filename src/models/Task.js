const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "O título da tarefa é obrigatório."],
      trim: true,
      maxlength: [100, "O título deve ter no máximo 100 caracteres."],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pendente", "Aceita", "Contestada", "Concluída"],
      default: "Pendente",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true, // Garante que toda tarefa do Axon pertença a um grupo de foco
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Task", taskSchema);
