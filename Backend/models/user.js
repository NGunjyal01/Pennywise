const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
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
    groups:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    }],
}, {timestamps: true});


module.exports = mongoose.model("User", userSchema);