const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // 1. Importe o bcrypt

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  code: { type: String, unique: true },
  password: { type: String, required: true, select: false },
  maxMembers: { type: Number, default: 10 },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// 2. Criptografar a senha automaticamente antes de salvar no banco
groupSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Group", groupSchema);
