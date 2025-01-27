const Transaction = require("../../models/transaction");
const User = require("../../models/user");

const deleteNonGroup = async(req,res)=>{
    try{
        const {transactionId} = req.body;
        const transaction = await Transaction.findByIdAndDelete(transactionId);
        if(!transaction){
            throw new Error("Transaction Not Found!!");
        }
        const {type,paidBy} = transaction;
        if(type==="personal"){
            await User.updateOne({_id:paidBy},{
                $pull:{transactions:transactionId}
            });
        }
        else{
            const {sharedWith} = transaction;
            const userIds = sharedWith.map(user => user.user);
            await User.updateMany(
                {_id: {$in: userIds}},
                {$pull: { transactions: transactionId}}
            );
        }

        return res.status(200).json({
            success:true,
            message:"Non Group Transaction Deleted Successfully"
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

module.exports = deleteNonGroup;