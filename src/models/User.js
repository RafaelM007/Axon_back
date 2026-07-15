const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, 
            trim: true,   
        },
        email: {
            type: String,
            required: true,
            unique: true,  
            lowercase: true,  
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        points: {
            type: Number,
            default: 0,  
        },
    },
    { timestamps: true } // cria createdAt e updatedAt automaticamente
);

module.exports = mongoose.model("User", userSchema);