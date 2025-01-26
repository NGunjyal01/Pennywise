const Group = require("../../models/group");

const addMembers = async(req,res)=>{
    try{
        const userId = req.user._id;
        const {groupId,members} = req.body;
        const group = await Group.findById(groupId);
        if(!group){
            throw new Error("Group Does not Exists");
        }
        const isAdmin = group.admin.toString()===userId.toString();
        if(!isAdmin){
            throw new Error("Only Admin Can Add new Members");
        }
        const isAllMembersAreFriends = members.some(memberId => req.user.friends.includes(memberId));
        if(!isAllMembersAreFriends){
            throw new Error("Some members are not your friend");
        }
        const includesAnyMember = members.some(memberId => group.members.includes(memberId));
        if(includesAnyMember){
            throw new Error("Some members already present");
        }
        const updatedMembers = [...group.members,...members];
        const updatedGroup = await Group.updateOne({_id:groupId},{
            $set:{
                members:updatedMembers
            }
        });
        if(!updatedGroup){
            throw new Error("Error While Adding New Members");
        }
        return res.status(200).json({
            success:true,
            message:"Successfully Added Members"
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

module.exports = addMembers;