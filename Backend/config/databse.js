const mongoose = require("mongoose");

const connectDb = async () =>{
    await mongoose.connect(process.env.MONGO_URI,{
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    });
};

module.exports = connectDb;