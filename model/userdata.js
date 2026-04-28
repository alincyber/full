const mongoose = require ("mongoose");
const {model,Schema} = mongoose;
const UserSchema = new Schema ({
    name:{type:String},
    phone:{type:String},
    email:{type:String},
    company:{type:String},
},{versionkey:false,statics:false,timestamps:true});

module.exports = model("User",UserSchema)