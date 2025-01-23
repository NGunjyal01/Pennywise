const friendRequest = require("../../models/friendRequest");

const send = async (req,res)=>{
    try{
        const {to} = req.params;
        const from = req.user._id;

        const newRequest = new friendRequest({from,to});
        const request = await friendRequest.findOne({
            $or:[
                {from:from , to:to},
                {from:to, to:from}
            ]
        });
        if(request){
            throw new Error("Friend request already sent");
        }
        await newRequest.save();
        return res.status(200).json({
            success: true,
            message: "Friend request sent"
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = send;