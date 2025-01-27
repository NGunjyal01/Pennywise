const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    type:{
        type: String,
        enum: ['personal', 'group', 'nonGroup'],
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    description:{
        type: String,
    },
    category:{
        type: String,
        required: true,
    },
    paidBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    splitMethod:{
        type: String,
        enum: ['equally', 'percentage', 'unEqually'],
        required: function () {
            return this.type !== "personal";
        },
    },
    sharedWith:[{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        amount:{
            type: Number,
        },
    }],
    groupId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        validate: {
            validator: function () {
              return this.type === "group";
            },
            message: "groupId is required for group transactions.",
        },
    },
    status:{
        type: String,
        enum: ['pending', 'settled'],
        default: function () {
            return this.type === "personal" ? "settled" : "pending";
        },
    }
},{timestamps: true});

module.exports = mongoose.model("Transaction", transactionSchema);