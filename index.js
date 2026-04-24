// import the tool(extenstion).
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const User = require("./model/userdata");
// connect the database.
mongoose.connect("/")
.then((result) => {
    console.log("the database waz work")
}).catch((err) => {
    console.log("the database wasm not responding")
});


// check the server is live 
app.get("/read",(req,res)=>{
    return res.json("the server is live for work")
});


// check the port was in work
app.listen(PORT,(req,res)=>{
    console.log(`the server is running on the http://localhost:${PORT}`)
});