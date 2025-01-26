const Transaction = require("../../models/transaction");
const User = require("../../models/user");

const deletePersonal = async(req,res)=>{
    try{
        const {transactionId} = req.body;
        const {user} = req;
        const transaction = await Transaction.findByIdAndDelete(transactionId);
        if(!transaction){
            throw new Error("Transaction Does not Exists");
        }
        const updatedUserTransactions = user.transactions.filter( transId => transId.toString()!==transactionId.toString());
        await User.updateOne({_id:user._id},{
            $set:{
                transactions:updatedUserTransactions
            }
        });
        return res.status(200).json({
            success:true,
            message:"Successfully Removed Transaction"
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

module.exports = deletePersonal;