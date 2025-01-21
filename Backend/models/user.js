const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    photoUrl:{
        type: String,
        default: "https://pbs.twimg.com/profile_images/1507682797611364359/g7w2Brfq_400x400.jpg",  
    },
    friends:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
}, {timestamps: true});


exports.User = mongoose.model("User", userSchema);