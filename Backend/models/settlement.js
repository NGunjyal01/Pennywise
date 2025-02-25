const mongoose = require("mongoose");

const settlementSchema = mongoose.Schema({
    transactionType:{
        type: String,
        enum: ['group','nonGroup'],
    },
    lendBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    lendTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    amount: {
        type: Number,
        default: 0,
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: function(){
            return this.transactionType==='group'
        }
    }
})

module.exports = mongoose.model("Settlement",settlementSchema);