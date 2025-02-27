const Transaction = require("../../models/transaction");
const User = require("../../models/user");
const Settlement = require("../../models/settlement");

const removeTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body;
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new Error("Transaction Not Found!!");
        }

        const { type, paidBy, amount, transactionType, sharedWith, groupId } = transaction;

        if (transactionType === 'settlement') {
            throw new Error("Settlement Transaction cannot be deleted");
        }

        if (transactionType === "personal") {
            const user = await User.findById(paidBy);
            if (!user) throw new Error("User not found");

            const totalSpending = Math.max(0, user.totalSpending - (type === 'debit' ? amount : 0));

            await User.updateOne(
                { _id: paidBy },
                {
                    $inc: {
                        currentBalance: type === 'credit' ? -amount : amount,
                        totalIncome: type === 'credit' ? -amount : 0
                    },
                    $set: { totalSpending }
                }
            );
        } else {
            const settlementUpdates = [];

            for (const user of sharedWith) {
                if (user.user.toString() !== paidBy.toString()) {
                    const existingSettlement = await Settlement.findOne({
                        lendBy: paidBy,
                        lendTo: user.user,
                        transactionType,
                        ...(transactionType === 'group' && { groupId })
                    });

                    if (existingSettlement) {
                        // Decrement settlement amount
                        existingSettlement.amount -= user.amount;

                        if (existingSettlement.amount <= 0) {
                            // If amount reaches zero, delete settlement
                            await Settlement.deleteOne({ _id: existingSettlement._id });
                        } else {
                            await existingSettlement.save();
                        }
                    } else {
                        // If no settlement exists, create a new one with reversed lendBy & lendTo
                        await Settlement.create({
                            lendBy: user.user,
                            lendTo: paidBy,
                            transactionType,
                            amount: user.amount,
                            ...(transactionType === 'group' && { groupId })
                        });
                    }
                }
            }

            // Ensure totalSpending does not go below 0
            const user = await User.findById(paidBy);
            if (!user) throw new Error("User not found");

            const totalSpending = Math.max(0, user.totalSpending - amount);

            await User.updateOne(
                { _id: paidBy },
                {
                    $inc: { currentBalance: amount },
                    $set: { totalSpending }
                }
            );
        }

        await Transaction.deleteOne({ _id: transaction._id });

        return res.status(200).json({
            success: true,
            message: "Transaction Deleted Successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = removeTransaction;
