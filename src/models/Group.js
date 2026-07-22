const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  code: { type: String, unique: true, required: true },
  password: { type: String, required: true, select: false },
  maxMembers: { type: Number, default: 10 },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // 🔥 NOVO FORMATO: Array de membros com ID do usuário e sua pontuação no grupo
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      points: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  ],
});

// Preserva o hook de senha pré-existente
groupSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("Group", groupSchema);
