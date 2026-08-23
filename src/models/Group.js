const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const groupSchema = new mongoose.Schema(
    {
      name: {
          type: String,
          required: [true, "O nome do grupo é obrigatório."],
          trim: true,
          minlength: [3, "O nome deve possuir no mínimo 3 caracteres."],
          maxlength: [100, "O nome deve possuir no máximo 100 caracteres."]
      },

      description:{
          type: String,
          default: "",
          trim: true,
          maxlength: [500, "A descrição deve possuir no máximo 500 caracteres."]
      },

      code: {
          type: String,
          required: true,
          unique: true,
          uppercase: true,
          trim: true
      },

      password: {
          type: String,
          default: "",
          trim: true,
          select: false
      },

      maxMembers: {
          type: Number,
          default: 10,
          min: [2, "O grupo deve possuir pelo menos 2 membros."],
          max: [100, "O grupo pode possuir no máximo 100 membros."]
      },

      creator: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
      },

      members: [
          {
              user: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: true
              },
              points: {
                  type: Number,
                  default: 0,
                  min: 0
              },
              pointsUpdatedAt: {
                  type: Date,
                  default: Date.now
            },
              role: {
                  type: String,
                  enum: ["admin", "member"],
                  default: "member"
              }
          }
      ],
 
    },
    {
    timestamps: true  
    }
  
);

groupSchema.pre("save", async function () {

    if (!this.isModified("password") || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});

module.exports = mongoose.model("Group", groupSchema);
