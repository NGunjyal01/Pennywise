const express = require('express');
const app = express();
const connectDb = require("./config/databse");
require("dotenv").config();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectDb().then(()=>{
    console.log("Database is Connected");
    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    })
}).catch((error)=>{
    console.log("Database connection failed",error);
});