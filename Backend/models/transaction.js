const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    transactionType:{
        type: String,
        enum: ['personal', 'group', 'nonGroup', 'settlement'],
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    type:{ 
        type: String, 
        enum: ['credit', 'debit'], 
        validate: {
            validator: function () {
              return this.transactionType === 'personal';
            },
            message: "this field this only for personal transaction",
        },
        required: function(){
            return this.transactionType==='personal'
        }
    },
    description:{
        type: String,
    },
    category:{
        type: String,
        required: function(){
            this.transactionType!=='settlement'
        }
    },
    paidBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function(){
            this.transactionType!=='settlement'
        }
    },
    splitMethod:{
        type: String,
        enum: ['equally', 'percentage', 'unEqually'],
        required: function () {
            return !['personal', 'settlement'].includes(this.transactionType);
        },
    },
    sharedWith:[{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        amount:{
            type: Number,
        }
    }],
    groupId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        // validate: {
        //     validator: function () {
        //       return this.transactionType === "group";
        //     },
        //     message: "groupId is required for group transactions.",
        // },
        required:function(){
            return this.transactionType==='group' || this.settlementType==='group';
        }
    },
    settlementType:{
        type: String,
        enum: ['nonGroup', 'group'],
        required: function () {
            return this.transactionType==='settlement'
        },
    },
    paymentDoneBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function(){
            this.transactionType==='settlement'
        }
    },
    paymentGivenTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function(){
            this.transactionType==='settlement'
        }
    }
    // status: {
    //     type: String,
    //     enum: ['pending', 'settled'],
    //     required: function () {
    //         return this.transactionType !== "personal"; 
    //     },
    //     default: "pending"
    // }
},{timestamps: true});

module.exports = mongoose.model("Transaction", transactionSchema);