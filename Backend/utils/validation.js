const validator = require('validator');

const validateSignupData = (req)=>{
    const {firstName, lastName, userName, email, password} = req.body;
    if(!firstName || !lastName || !userName || !email || !password){
        throw new Error("Please enter all fields");
    }
    if(!validator.isEmail(email)){
        throw new Error("Please enter a valid email");
    }
    if(!validator.isStrongPassword(password)){
        throw new Error("Please enter a strong password");
    }
};

module.exports = {validateSignupData};