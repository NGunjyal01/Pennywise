const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const login = async(req, res) => {
    try{
        const {email, password} = req.body;

        const existingUser = await User.findOne({email})
        .populate("friends","firstName lastName userName photoUrl")
        .populate("groups");
        if(!existingUser){
            return res.status(404).json({
                success: false,
                message: "User does not exist"
            })
        }

        if(!await bcrypt.compare(password, existingUser.password)){
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const token = jwt.sign({email: existingUser.email, id: existingUser._id}, process.env.JWT_SECRET_KEY, {expiresIn: "7d"});
        return res.status(200).cookie("token",token,{expires: new Date(Date.now() + 168*3600000)}).json({
            success: true,
            user: existingUser,
            message: "Login successful"
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = login;