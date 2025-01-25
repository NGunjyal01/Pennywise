const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
    },
    photoUrl:{
        type: String,
        default: "https://pbs.twimg.com/profile_images/1507682797611364359/g7w2Brfq_400x400.jpg",
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    transactions:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
    }]

},{timestamps: true});

module.exports = mongoose.model("Group", groupSchema);