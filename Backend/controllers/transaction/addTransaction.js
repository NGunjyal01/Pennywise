const Transaction = require("../../models/transaction");
const User = require("../../models/user");
const Settlement = require("../../models/settlement");

// Handles personal transactions
const handlePersonalTransaction = async (req, res, transactionType, paidBy, amount, category, description) => {
    const { type } = req.body;
    const transaction = new Transaction({ transactionType, amount, category, paidBy, description, type });

    const balanceUpdate = {
        $inc: { 
            currentBalance: type === 'credit' ? amount : -amount,
            [type === 'credit' ? 'totalIncome' : 'totalSpending']: amount 
        }
    };

    await Promise.all([transaction.save(), User.updateOne({ _id: paidBy }, balanceUpdate)]);

    return res.status(200).json({ success: true, message: "Personal transaction added successfully" });
};

// Handles shared (group/non-group) transactions
const handleSharedTransaction = async (req, res, transactionType, paidBy, amount, category, description) => {
    if (transactionType === 'group' && !req.body.groupId) {
        throw new Error("Group ID is required for group transactions");
    }

    const { splitMethod, sharedWith, groupId } = req.body;
    const updatedSharedWith = distributeAmount(sharedWith, splitMethod, amount);

    const newTransaction = new Transaction({
        transactionType, amount, category, paidBy, description, sharedWith: updatedSharedWith, splitMethod,
        ...(transactionType === 'group' && { groupId })
    });

    const settlementUpdates = updatedSharedWith
        .filter(user => user.user.toString() !== paidBy.toString()) // Exclude payer
        .map(user => ({
            updateOne: {
                filter: { lendBy: paidBy, lendTo: user.user, transactionType, ...(transactionType === 'group' && { groupId }) },
                update: {
                    $inc: { amount: user.amount },
                    $setOnInsert: { lendBy: paidBy, lendTo: user.user, transactionType, ...(transactionType === 'group' && { groupId }) }
                },
                upsert: true
            }
        }));

    const userUpdateOperations = [
        newTransaction.save(),
        User.updateOne({ _id: paidBy }, { $inc: { totalSpending: amount, currentBalance: -amount } })
    ];

    if (settlementUpdates.length > 0) {
        userUpdateOperations.push(Settlement.bulkWrite(settlementUpdates));
    }

    await Promise.all(userUpdateOperations);

    return res.status(200).json({ success: true, message: "Shared transaction added successfully" });
};

// Distributes the amount based on the split method
const distributeAmount = (sharedWith, splitMethod, totalAmount) => {
    if (!Array.isArray(sharedWith) || sharedWith.length === 0) {
        throw new Error("SharedWith array is required for shared transactions");
    }

    if (splitMethod === "unEqually") {
        const sum = sharedWith.reduce((acc, user) => acc + Number(user.amount), 0);
        if (sum !== Number(totalAmount)) throw new Error("Sum of all amounts does not match total amount");
    } else if (splitMethod === "percentage") {
        const sum = sharedWith.reduce((acc, user) => acc + Number(user.amount), 0);
        if (sum !== 100) throw new Error("Total percentage must be 100%");
        sharedWith.forEach(user => user.amount = (user.amount * totalAmount) / 100);
    } else {
        const splitAmount = totalAmount / sharedWith.length;
        sharedWith.forEach(user => user.amount = splitAmount);
    }

    return sharedWith;
};

const addTransaction = async (req, res) => {
    try {
        const { transactionType, paidBy, amount, category, description = null } = req.body;

        if (transactionType === 'personal') {
            return await handlePersonalTransaction(req, res, transactionType, paidBy, amount, category, description);
        } else {
            return await handleSharedTransaction(req, res, transactionType, paidBy, amount, category, description);
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = addTransaction;
