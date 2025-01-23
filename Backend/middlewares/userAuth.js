const jwt = require("jsonwebtoken");
const User = require("../models/user"); 

const userAuth = async(req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
            throw new Error("You need to login first");
        }
        const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const {_id,email} = decodedMessage;;
        const user = await User.findOne({email});
        if(!user){
            throw new Error("User not found");
        }
        req.user = user;
        next();
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = userAuth;