const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    // Referência à tarefa que está sendo contestada
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    // Usuário que abriu a contestação
    contestant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Grupo onde a contestação ocorreu
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    // Lista com os votos individuais dos membros do grupo
    votes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        // "INVALID" = opção 1 (realmente tem algo errado)
        // "VALID" = opção 2 (está tudo certo)
        choice: {
          type: String,
          enum: ["INVALID", "VALID"],
          required: true,
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Status atual da contestação
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    
    // Data limite para encerramento automático (24 horas após criação)
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Cria automaticamente createdAt e updatedAt
  }
);

module.exports = mongoose.model("Vote", voteSchema);