const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "O título da tarefa é obrigatório."],
      trim: true,
      minlength: [3, "O título deve ter no mínimo 3 caracteres."],
      maxlength: [100, "O título deve ter no máximo 100 caracteres."]
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "A descrição deve ter no máximo 500 caracteres."]
    },

    points: {
      type: Number,
      default: 10,
      min: [0, "A pontuação não pode ser negativa."]
    },

    deadline: {
      type: Date,
      default: null
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Task", taskSchema);
