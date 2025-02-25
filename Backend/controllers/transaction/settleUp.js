const Settlement = require("../../models/settlement");
const User = require("../../models/user");
const Transaction = require("../../models/transaction");

const settleUp = async(req,res)=>{
    try{
        const {lendBy,lendTo,transactionType,settleUpAmount} = req.body;
        const {user} = req;
        // if(user._id!==lendTo){
        //     throw new Error("You can't settle up this because you are not owed to this user");
        // }
        if(!['group','nonGroup'].includes(transactionType)){
            throw new Error("Only group & nonGroup settlement are allowed")
        }
        const settlement = await Settlement.findOne({lendBy,lendTo,transactionType});
        if(!settlement){
            throw new Error("Settlement not Found");
        }
        if(settleUpAmount>settlement.amount){
            throw new Error("Settle Amount is more than the actual amount");
        }
        const operations=[User.updateOne({_id:lendBy},{$inc:{currentBalance:settleUpAmount, totalSpending: -settleUpAmount}}),
            User.updateOne({_id:lendTo},{$inc:{currentBalance:-settleUpAmount, totalSpending: settleUpAmount}})
        ];
        if(settleUpAmount===settlement.amount){
            operations.push(Settlement.findOneAndDelete({lendBy,lendTo,transactionType}));
        }
        else{
            operations.push(Settlement.updateOne({_id:settlement._id},{$inc:{amount:-settleUpAmount}}));
        }
        const transaction = new Transaction({
            transactionType:"settlement",
            settlementType:transactionType,
            amount:settleUpAmount,
            paymentDoneBy:lendTo,
            paymentGivenTo:lendBy,
            ...(transactionType === 'group' && { groupId:req.body.groupId })
        })
        operations.push(transaction.save());
        await Promise.all(operations);
        return res.status(200).json({
            success:true,
            message:"Successfully Settled Up"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

module.exports = settleUp;