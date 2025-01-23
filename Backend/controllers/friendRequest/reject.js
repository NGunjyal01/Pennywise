const friendRequest = require("../../models/friendRequest");

const reject = async (req,res)=>{
    try{
        const {to} = req.params;
        const from = req.user._id;

        const request = await friendRequest.findOneAndDelete({
            from,
            to
        });
        if(!request){
            throw new Error("Friend request not found");
        }
        return res.status(200).json({
            success: true,
            message: "Friend request rejected"
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = reject;