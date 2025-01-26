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
    debts:[{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        amount:{
            type:Number,
            default:0,
        },
        type:{
            type: String,
            enum: ["owe","owed"],
            required:true,
        }
    }],
    friends:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    groups:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    }],
    transactions:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction"
    }]
}, {timestamps: true});


module.exports = mongoose.model("User", userSchema);