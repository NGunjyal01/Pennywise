const Group = require("../../models/group");

const removeMember = async(req,res)=>{
    try{
        const {groupId,member} = req.body;
        const userId = req.user._id;
        const group = await Group.findById(groupId);
        if(!group){
            throw new Error("Group Does not Exists");
        }
        const isAdmin = group.admin.toString() === userId.toString();
        if(!isAdmin){
            throw new Error("Only Admin Can Remove Member");
        }
        const isMember = group.members.includes(member);
        if(!isMember){
            throw new Error(`${member} is not a Member of group ${groupId}`);
        }
        const updatedMembers = group.members.filter(memberId => memberId.toString()!==member.toString());
        const updatedGroup = await Group.updateOne({_id:groupId},{
            $set:{
                members:updatedMembers
            }
        });
        if(!updatedGroup){
            throw new Error("Error While Updating Group");
        }
        return res.status(200).json({
            success:true,
            message:`${member} is Removed Successfully`
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

module.exports = removeMember;