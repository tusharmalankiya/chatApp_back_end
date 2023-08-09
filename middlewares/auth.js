require("dotenv").config();
const jwt = require("jsonwebtoken");



module.exports.auth = (req, res, next)=>{
    const token = req.cookies.token;
    // console.log(token);
    if(!token){
        console.log("Token hasn't provided");
        return res.status(401).json({"message":"no token"});
    }
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        console.log(payload);
        next();
    }catch(err){
        console.log("jwt verify error");
        res.status(401).json({"message":"JWT not verified"});

    }
}