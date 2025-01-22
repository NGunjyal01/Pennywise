const express = require('express');
const app = express();
const connectDb = require("./config/databse");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");

app.use(express.json());
app.use(cookieParser());

app.use("/",authRoutes);

connectDb().then(()=>{
    console.log("Database is Connected");
    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    })
}).catch((error)=>{
    console.log("Database connection failed",error);
});