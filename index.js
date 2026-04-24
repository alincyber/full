// import the tool(extenstion).
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const User = require("./model/userdata");
// connect the database.
mongoose.connect("mongodb://localhost:27017/full")
.then((result) => {
    console.log("the database waz work")
}).catch((err) => {
    console.log("the database wasm not responding")
});

app.use(express.json());
// this is the post method API use for make the 
app.post("/make",async(req,res)=>{
    try {
        const{name,phone,email,company}=req.body;
        if(!name || !phone || !email || !company ){
        return res.status(400).json({
            message:"please enter all the feilds",
        });
        }
        const exist = await User.findOne({name:name});
        if (exist){
            return res.status(409).json({
                message:"the user is already exist in database",
                data:exist,
            });
        }
        const userdata = new User({
            name,
            phone,
            email,
            company
        });
        await userdata.save();
        return res.status(201).json({
            message:"new user is created",
            data:userdata,
        });
    } catch (error) {
        return res.status(500).json({
            error:error.message,
        });
    }
});

// check the server is live 
app.get("/read",(req,res)=>{
    return res.json("mera server live ho chuka h or mene ye post-man pe kr liye h")
});


// check the port was in work
app.listen(PORT,(req,res)=>{
    console.log(`the server is running on the http://localhost:${PORT}`)
});