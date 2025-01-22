const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    type:{
        type: String,
        enum: ['personal', 'group', 'lending','borrowing'],
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
    spiltMethod:{
        type: String,
        enum: ['equally', 'percentage', 'amount'],
        required: function () {
            return this.type === "group";
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
        required: function () {
            return this.type === "group";
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
    lendTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        validate: {
            validator: function () {
              return this.type === "lending";
            },
            message: "lendTo is required for lending transactions.",
        },
    },
    borrowFrom:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        validate: {
            validator: function () {
              return this.type === "borrowing";
            },
            message: "borrowFrom is required for borrowing transactions.",
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