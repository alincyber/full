const mongoose = require ("mongoose");
const strict = require("node:assert/strict");
const { timeStamp } = require("node:console");
const {model,Schema} = mongoose;
const UserSchema = ({
    name:{type:String},
    phone:{type:String},
    email:{type:String},
    company:{type:String},
},{timeStamp:true,versionkey:false,strict:false});

module.exports = ("user",UserSchema)