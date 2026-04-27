const cors = require ("cors");
const {ALLOWLIST}= require("../config/config");


const corsMiddleware = (req,res,next)=>{
    const corsOptions = {
        origin:function (origin,callback){
        if(!origin || ALLOWLIST.includes(origin)){
            callback (null,true);
        }else {
            console.log("cors is blocked:",origin);
            callback(new error("not allowed by cors"));
        }
        },
        method:["GET","POST","PUT","DELETE","OPTIONS","PATCH"],
        allowedheader:["content-type","Authorization"],
        Credential:true,
    };
    return cors(corsOptions)(req,resz,next);
};
module.exports= corsMiddleware