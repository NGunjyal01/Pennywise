const User = require('../models/user');
const bcrypt = require('bcrypt');
const { validateSignupData } = require('../utils/validation');

const signup = async (req, res)=>{
    try{
        const {firstName, lastName, userName, email, password} = req.body;
        validateSignupData(req);
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName, lastName, userName, email, password: hashPassword
        });
        await user.save();
        res.status(200).json({
            success: true,
            message: "User created successfully"
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = signup;