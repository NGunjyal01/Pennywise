const Group = require("../../models/group");

const addMembers = async(req,res)=>{
    try{
        const {groupId,members} = req.body;
        const isAllMembersAreFriends = members.some(memberId => req.user.friends.includes(memberId));
        if(!isAllMembersAreFriends){
            throw new Error("Some members are not your friend");
        }
        const group = await Group.findById(groupId);
        if(!group){
            throw new Error("Group Does not Exists");
        }
        const includesAnyMember = members.some(memberId => group.members.includes(memberId));
        if(includesAnyMember){
            throw new Error("Some members already present");
        }
        members.forEach( memberId => group.members.push(memberId));
        await group.save();
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