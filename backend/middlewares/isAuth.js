const jwt = require("jsonwebtoken");

 const isAuth = async function(req,res,next){
   try{
     const token = req.cookies.token;
     if(!token){
      return res.status(400).json({message:"token not found"});
     }
     const decodeToken = jwt.verify(token , process.env.SECRET_KEY);
     if(!decodeToken){
      return res.status(400).json({message:"token not found"});
     }
     console.log(decodeToken);
     req.userId = decodeToken.userId;
     next();
   }catch(error){
     return res.status(500).json({message:"isAuth error"});
   }
}

module.exports = {isAuth};