const Group = require("../../models/group");

const getDetails = async(req,res)=>{
    try{
        const {groupId} = req.body;
        const group = await Group.findById(groupId)
        .populate("members","firstName lastName userName photoUrl")
        .populate("transactions");
        if(!group){
            throw new Error("Group Does not Exists");
        }
        return res.status(200).json({
            success:true,
            groupDetails:group,
            message: "Successfully Fetched Group Details"
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

module.exports = getDetails;