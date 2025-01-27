const Transaction = require("../../models/transaction");
const User = require("../../models/user");
const Group = require("../../models/group");

const addExpense = async(req,res)=>{
    try{
        const {type,paidBy,amount,category} = req.body;
        // validateExpenseData(req);
        const {user} = req;
        const description = req.body.description || null;
        if(type==='personal'){
            const transaction = new Transaction({type,amount,category,paidBy,description});
            user.transactions.push(transaction._id);
            Promise.all([transaction.save(),user.save()]);
        }
        else{
            const {splitMethod,sharedWith} = req.body;
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
            if(type==="group"){
                const {groupId} = req.body;
                await Group.updateOne({_id:groupId},{
                    $push: {transactions:newTransaction}
                });
            }
        }
        return res.status(200).json({
            success:true,
            message:"Transaction added Successfully"
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

module.exports = addExpense;