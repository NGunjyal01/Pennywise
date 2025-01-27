const Transaction = require("../../models/transaction");

const addPersonal = async(req,res)=>{
    try{
        const {type,amount,category} = req.body;
        if(!type || !amount || !category){
            throw new Error("Please Fill All Requried Fields");
        }
        const {user} = req;
        const paidBy = user._id;
        const description = req.body.description || null;
        if(type!=="personal"){
            throw new Error("This is for Personal Spending");
        }
        const transaction = new Transaction({type,amount,category,paidBy,description});
        user.transactions.push(transaction._id);
        Promise.all([transaction.save(),user.save()]);
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

module.exports = addPersonal;