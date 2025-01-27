const Transaction = require("../../models/transaction");
const User = require("../../models/user");

const addNonGroup = async(req,res)=>{
    try{
        const {type,paidBy,amount,category,splitMethod,sharedWith} = req.body;
        if(type!=="nonGroup"){
            throw new Error("This is for Non Group Transaction");
        }
        const description = req.body.description || null;
        if(splitMethod==="unEqually"){
            let sum=0;
            sharedWith.forEach(user=> sum+=Number(user.amount));
            if(sum!==Number(amount)){
                throw new Error("Sum of all amount is not equal to total amount");
            }
        }
        else if(splitMethod==="percentage"){
            let sum=0;
            sharedWith.forEach(user=> sum+=Number(user.amount));
            if(sum!==100){
                throw new Error("Percentage Sum is not equal to 100");
            }
            sharedWith.forEach(user=>{
                user.amount = user.amount*amount/100;
            });
        }
        else{
            const splitAmount = amount/sharedWith.length;
            sharedWith.forEach(user => user.amount=splitAmount);
        }
        const newTransaction = new Transaction({
            type,amount,description,category,paidBy,sharedWith,
            splitMethod
        });
        await newTransaction.save();
        const userIds = sharedWith.map(user => user.user);
        await User.updateMany(
            {_id: {$in: userIds}},
            {$push: { transactions: newTransaction._id}}
        );
        return res.status(200).json({
            success:true,
            message: "Non Group Transaction Added Successfully"
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

module.exports = addNonGroup;