const mongoose = require("mongoose");

const taskSubmissionSchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: [true, "A tarefa é obrigatória."]
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "O usuário é obrigatório."]
        },

        status: {
            type: String,
            enum: [
                "Pendente",
                "Enviada",
                "Aceita",
                "Contestada"
            ],
            default: "Pendente",
            required: true
        },

        evidence: {
            url: {
                type: String,
                default: ""
            },

            publicId: {
                type: String,
                default: ""
            }
        },

        feedback: {
            type: String,
            default: "",
            trim: true,
            maxlength: [500, "O feedback deve ter no máximo 500 caracteres."]
        },

        submittedAt: {
            type: Date,
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Impede que um usuário envie duas submissões para a mesma tarefa
taskSubmissionSchema.index(
    {
        task: 1,
        user: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("TaskSubmission", taskSubmissionSchema);