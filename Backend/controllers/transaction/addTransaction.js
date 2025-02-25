const Transaction = require("../../models/transaction");
const User = require("../../models/user");
const Group = require("../../models/group");
const Settlement = require("../../models/settlement");

const addTransaction = async(req,res)=>{
    try{
        const {transactionType,paidBy,amount,category} = req.body;
        // validateExpenseData(req);
        const {user} = req;
        const description = req.body.description || null;
        if(transactionType==='personal'){
            const {type} = req.body;
            const transaction = new Transaction({transactionType,amount,category,paidBy,description,type});
            if(type==='credit'){
                await Promise.all([transaction.save(),User.updateOne({_id:paidBy}, { 
                    $inc: { currentBalance: amount, totalIncome: amount } 
                })]);
            }
            else{
                await Promise.all([transaction.save(),User.updateOne({_id:paidBy}, { 
                    $inc: { currentBalance: -amount, totalSpending: amount } 
                })]);
            }
        }
        else{
            if(transactionType==='group' && !req.body.groupId){
                throw new Error("Required GroupId");
            }
            const {splitMethod,sharedWith,groupId} = req.body;
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
                transactionType, amount, description, category, paidBy, sharedWith, splitMethod,
                ...(transactionType === 'group' && { groupId })
            });
            // const updates = sharedWith.map(user => ({
            //     updateOne: {
            //         filter: { _id: user.user },
            //         update: { $inc: { totalSpending: user.user===paidBy?amount:user.amount, currentBalance: user.user===paidBy?-amount:-user.amount } }
            //     }
            // }));
            // await Promise.all([newTransaction.save(),User.bulkWrite(updates)]);
            const settlementUpdates = [];

            sharedWith.forEach(user => {
                if (user.user.toString() !== paidBy.toString()) { // Exclude paidBy
                    settlementUpdates.push({
                        updateOne: {
                            filter: { lendBy: paidBy, lendTo: user.user, transactionType, ...(transactionType === 'group' && { groupId }) },
                            update: { 
                                $inc: { amount: user.amount },
                                $setOnInsert: {  // Ensures necessary fields for new settlements
                                    lendBy: paidBy,
                                    lendTo: user.user,
                                    transactionType,
                                    ...(transactionType === 'group' && { groupId })
                                }
                            },
                            upsert: true // Creates if not found
                        }
                    });
                }
            });
            
            const operations = [
                newTransaction.save(),
                User.updateOne(
                    { _id: paidBy },
                    { $inc: { totalSpending: amount, currentBalance: -amount } }
                )
            ];
            
            if (settlementUpdates.length > 0) {
                operations.push(Settlement.bulkWrite(settlementUpdates));
            }
            
            await Promise.all(operations);
             
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

module.exports = addTransaction;