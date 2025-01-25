const Group = require("../../models/group");

const create = async (req,res)=>{
    try{
        const {name} = req.body;
        const admin = req.user._id;
        const members = [admin];
        let description = null;
        if(req.body.description){
            description = req.body.description;
        }
        const group = new Group({name,admin,members,description});
        await group.save();
        return res.status(200).json({
            success:true,
            message: "Group Created Successfully"
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

module.exports = create;