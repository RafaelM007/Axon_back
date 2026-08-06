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
        evidence: {
            url: {
                type: String,
                required: [true, "A imagem da evidência é obrigatória."]
            },

            publicId: {
                type: String,
                required: [true, "O identificador da imagem é obrigatório."]
            }
        },
        status: {
            type: String,
            enum: [
                "submitted",
                "voting",
                "completed",
                "invalid"
            ],
            default: "submitted"
        },
        contestation: {
            reason: {
                type: String,
                default: "",
                trim: true,
                maxlength: [500, "O motivo da contestação deve possuir no máximo 500 caracteres."]
            },

            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null
            },

            createdAt: {
                type: Date,
                default: null
            }
        },
        votes: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },

                decision: {
                    type: String,
                    enum: ["valid", "invalid"],
                    required: true
                },

                votedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        pointsGranted: {
            type: Boolean,
            default: false
        },
        validatedAt: {
            type: Date,
            default: null
        },

    },

    {
        timestamps: true
    }

);


taskSubmissionSchema.index(
    { task: 1, user: 1 },
    { unique: true }
);

module.exports = mongoose.model("TaskSubmission", taskSubmissionSchema);