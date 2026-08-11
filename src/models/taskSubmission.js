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
                "accepted",
                "voting",
                "invalidated"
            ],
            default: "accepted"
        },
        contest: {
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
            },
            resolved: {
                type: Boolean,
                default: false
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
                    enum: ["accepted", "invalidated"],
                    required: true
                },

                votedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        initialValidations: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },

                action: {
                    type: String,
                    enum: [
                        "approved",
                        "contested"
                    ],
                    required: true
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        rewardProcessed:{ // Indica se a recompensa já foi processada
            type: Boolean,
            default: false
        },
        finishedAt: {
            type: Date,
            default: null
        },
        finalDecision: {
            type: String,
            enum: [
                "accepted",
                "invalidated"
            ],
            default: null
        }

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