const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(

    {
        title: {
            type: String,
            required: [true, "O título da tarefa é obrigatório."],
            trim: true,
            minlength: [3, "O título deve possuir no mínimo 3 caracteres."],
            maxlength: [100, "O título deve possuir no máximo 100 caracteres."]
        },
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: [500, "A descrição deve possuir no máximo 500 caracteres."]
        },
        points: {
            type: Number,
            required: [true, "A pontuação da tarefa é obrigatória."],
            min: [1, "A tarefa deve valer pelo menos 1 ponto."]
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: [true, "O grupo é obrigatório."]
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "O criador da tarefa é obrigatório."]
        },
        startsAt: {
            type: Date,
            required: [true, "A data de início da tarefa é obrigatória."]
        },
        deadline: {
            type: Date,
            required: [true, "O prazo da tarefa é obrigatório."]
        },
        isRecurring: {
            type: Boolean,
            default: false
        },
        parentTask: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            default: null
        },
        recurrence: {
            frequency: {
                type: String,
                enum: ["none", "daily", "weekly", "monthly"],
                default: "none"
            },

            occurrences: {
                type: Number,
                default: 1,
                min: [1, "A recorrência deve possuir pelo menos uma ocorrência."]
            }
        },
    },


    {
        timestamps: true
    }

);

taskSchema.pre("validate", function () {

    if (!this.isRecurring) {
        this.recurrence.frequency = "none";
        this.recurrence.occurrences = 1;
        return;
    }

    if (this.recurrence.frequency === "none") {
        this.invalidate(
            "recurrence.frequency",
            "Tarefas recorrentes devem possuir uma frequência válida."
        );
    }

    if (!this.recurrence.occurrences || this.recurrence.occurrences < 1) {
        this.invalidate(
            "recurrence.occurrences",
            "Informe uma quantidade válida de ocorrências."
        );
    }

});

module.exports = mongoose.model("Task", taskSchema);
