const Transaction = require("../../models/transaction");
const User = require("../../models/user");
const Settlement = require("../../models/settlement");

const editTransaction = async(req,res)=>{
    try{
        const {transactionId} = req.body;
        const transaction = await Transaction.findById(transactionId);
        if(!transaction){
            throw new Error("Transaction Not Found!!");
        }
        const {transactionType} = transaction;
        if(transactionType==='settlement'){
            throw new Error("Settlement Transaction can not be deleted");
        }
        else if(transactionType==='personal'){
            const { type, paidBy } = transaction;
            const { amount, description, category } = req.body;
            
            if (paidBy.toString() !== req.user._id.toString()) {
                throw new Error("You cannot edit this transaction because this is not your transaction");
            }
            
            if (amount !== undefined && transaction.amount === amount) {
                throw new Error("New Amount is the same as the previous amount");
            }
            
            const updateFields = {};
            if (description !== undefined) updateFields.description = description;
            if (category !== undefined) updateFields.category = category;
            if (Object.keys(updateFields).length === 0 && amount===undefined) {
                throw new Error("No valid fields to update");
            }
            const operations = [Transaction.updateOne({ _id: transaction._id }, { $set: updateFields })]
            if (amount !== undefined) {
                const diffAmount = amount - transaction.amount; // Positive if increased, negative if decreased
            
                const updateQuery = type === 'credit'
                    ? { $inc: { totalIncome: diffAmount, currentBalance: diffAmount } }  // Increase/decrease income and balance
                    : { $inc: { totalSpending: diffAmount, currentBalance: -diffAmount } }; // Increase/decrease spending and balance
            
                operations.push(User.updateOne({ _id: req.user._id }, updateQuery));
            }
            await Promise.all(operations);            
        }
        else{
            // const {sharedWith} = transaction;
            const oldSharedWith = transaction.sharedWith;
            const {amount, description, category, paidBy, splitMethod, sharedWith} = req.body;
            
            if (amount !== undefined && transaction.amount === amount) {
                throw new Error("New Amount is the same as the previous amount");
            }
            
            const updateFields = {};
            if (description !== undefined) updateFields.description = description;
            if (category !== undefined) updateFields.category = category;
            if(paidBy !== undefined) updateFields.paidBy = paidBy;
            if(splitMethod !== undefined) updateFields.splitMethod = splitMethod;
            if(sharedWith !== undefined) updateFields.sharedWith = sharedWith;
            if (Object.keys(updateFields).length === 0 && amount===undefined) {
                throw new Error("No valid fields to update");
            }

            if(splitMethod!==undefined){
                if(splitMethod==="unEqually"){
                    let sum=0;
                    sharedWith!==undefined?sharedWith.forEach(user=> sum+=Number(user.amount)):oldSharedWith.forEach(user=> sum+=Number(user.amount))
                    if(sum!==(amount!==undefined?Number(amount):Number(transaction.amount))){
                        throw new Error("Sum of all amount is not equal to total amount");
                    }
                }
                else if(splitMethod==="percentage"){
                    let sum=0;
                    sharedWith!==undefined?sharedWith.forEach(user=> sum+=Number(user.amount)):oldSharedWith.forEach(user=> sum+=Number(user.amount))
                    if(sum!==100){
                        throw new Error("Percentage Sum is not equal to 100");
                    }
                    sharedWith!==undefined?sharedWith.forEach(user=>{
                        user.amount = user.amount*(amount!==undefined ? amount : transaction.amount)/100;
                    }): oldSharedWith.forEach(user=>{
                        user.amount = user.amount*(amount!==undefined ? amount : transaction.amount)/100;
                    });
                }
                else{
                    const splitAmount = (amount!==undefined ? amount : transaction.amount)/sharedWith.length;
                    sharedWith!==undefined?sharedWith.forEach(user => user.amount=splitAmount):oldSharedWith.forEach(user => user.amount=splitAmount);
                }
                if(sharedWith===undefined){
                    updateFields.sharedWith=oldSharedWith;
                }
            }
            else if(splitMethod===undefined && sharedWith!==undefined){
                if(transaction.splitMethod==="unEqually"){
                    let sum=0;
                    sharedWith.forEach(user=> sum+=Number(user.amount));
                    if(sum!==(amount!==undefined?Number(amount):Number(transaction.amount))){
                        throw new Error("Sum of all amount is not equal to total amount");
                    }
                }
                else if(transaction.splitMethod==="percentage"){
                    let sum=0;
                    sharedWith.forEach(user=> sum+=Number(user.amount));
                    if(sum!==100){
                        throw new Error("Percentage Sum is not equal to 100");
                    }
                    sharedWith.forEach(user=>{
                        user.amount = user.amount*(amount!==undefined ? amount : transaction.amount)/100;
                    });
                }
                else{
                    const splitAmount = (amount!==undefined ? amount : transaction.amount)/sharedWith.length;
                    sharedWith.forEach(user => user.amount=splitAmount);
                }
            }
            const operations = [];
            const settlementUpdates = [];

            if(paidBy!==undefined){
                updateFields.sharedWith.forEach(user => {
                    if (user.user.toString() !== paidBy.toString()) { // Exclude paidBy
                        settlementUpdates.push({
                            updateOne: {
                                filter: { lendBy: paidBy, lendTo: user.user, transactionType, ...(transactionType === 'group' && { groupId }) },
                                update: { 
                                    $inc: { amount: user.amount },
                                    $setOnInsert: {  // Ensures necessary fields for new settlements
                                        lendBy: user.user,
                                        lendTo: paidBy,
                                        transactionType,
                                        amount: user.amount,
                                        ...(transactionType === 'group' && { groupId })
                                    }
                                },
                                upsert: true // Creates if not found
                            }
                        });
                    }
                });
                const oldSettlement = Settlement.findOne({lendBy: transaction.paidBy, lendTo: paidBy, transactionType, ...(transactionType === 'group' && { groupId })});
                if(oldSettlement.amount===updateFields.sharedWith[paidBy].amount){
                    settlementUpdates.push(deleteOne({lendBy: transaction.paidBy, lendTo: paidBy, transactionType, ...(transactionType === 'group' && { groupId })}))
                }
                else{
                    settlementUpdates.push(
                        updateOne({lendBy: transaction.paidBy, lendTo: paidBy, transactionType, ...(transactionType === 'group' && { groupId }),
                        $inc:{amount:-updateFields.sharedWith[paidBy].amount}}))
                }
                if (amount !== undefined) {
                    const diffAmount = amount - transaction.amount; // Positive if increased, negative if decreased
                
                    const updateQuery = { $inc: { totalSpending: diffAmount, currentBalance: -diffAmount } }; // Increase/decrease spending and balance
                
                    operations.push(User.updateOne({ _id: transaction.paidBy }, updateQuery));
                    operations.push(User.updateOne({ _id: paidBy},{ $inc:{ totalSpending: amount, currentBalance: amount }}));
                }
            }
            else if(paidBy===undefined){
                updateFields.sharedWith.forEach(user => {
                    if (user.user.toString() !== transaction.paidBy.toString()) { // Exclude paidBy
                        settlementUpdates.push({
                            updateOne: {
                                filter: { lendBy: paidBy, lendTo: user.user, transactionType, ...(transactionType === 'group' && { groupId }) },
                                update: { 
                                    $inc: { amount: -user.amount },
                                    $setOnInsert: {  // Ensures necessary fields for new settlements
                                        lendBy: user.user,
                                        lendTo: paidBy,
                                        transactionType,
                                        amount: user.amount,
                                        ...(transactionType === 'group' && { groupId })
                                    }
                                },
                                upsert: true // Creates if not found
                            }
                        });
                    }
                });
                if (amount !== undefined) {
                    const diffAmount = amount - transaction.amount; // Positive if increased, negative if decreased
                
                    const updateQuery = { $inc: { totalSpending: diffAmount, currentBalance: -diffAmount } }; // Increase/decrease spending and balance
                
                    operations.push(User.updateOne({ _id: transaction.paidBy }, updateQuery));
                }
            }
            if (settlementUpdates.length > 0) {
                operations.push(Settlement.bulkWrite(settlementUpdates));
            }
            await Promise.all(operations);
        }

        return res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

module.exports = editTransaction;