const express= require("express");
const app=express();
// schema used when  creating documents
const mongoose=require("mongoose");
const User=require('./model/user');
const dotenv=require('dotenv');
dotenv.config({path: './config.env'});
const Database=process.env.DATABASE;
const Port=process.env.PORT;
app.use(require('./router/auth'));

app.use(express.json());    
app.use(express.urlencoded({ extended: true }));
app.get("/",(req,res)=>{
    res.send("Welcome to home page");
})



mongoose.connect(Database,()=>{
    console.log("db connected");
    app.listen(Port,()=>{
        console.log(`Listening at port no. ${Port}`);
    });
})