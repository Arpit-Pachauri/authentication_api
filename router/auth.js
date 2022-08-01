const express=require('express');
const User = require( '../model/user' );
const router = express.Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const cookieParser = require("cookie-parser");
router.use(cookieParser());
router.use(express.json());    
const dotenv=require('dotenv');
dotenv.config({path: './config.env'});
const SECRET_KEY=process.env.SECRET_KEY;
const { ObjectId } = require( "mongodb" );

// authorization

const authorization = (req, res, next) => {
  const token = req.cookies.jwtoken;
  console.log(token);
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data =jwt.verify(token, SECRET_KEY);
    // req._id = data.id;
    return next();
  } catch {
    return res.sendStatus(403);
  }
};




// 1st user Signup


router.post('/user/signup',(req,res)=>{
    // console.log("entered");
    // console.log(req.body);
  const {name, email,profileType,userName,phoneNumber,profileImage,bio,displayName,password,cpassword}=req.body;
  if(!name || !email || !password || !cpassword , !profileType || !userName || !phoneNumber || !profileImage || !bio || !displayName){
      res.status(422).json({err: "plz fill all the details"});
  }
   User.findOne({email: email})
   .then((userExist)=>{
       if(userExist){
           return res.status(422).json({err: "Email already exist"});
       }
       else if(password!=cpassword){
        return res.status(422).json({err: "Password not matching"});
       }
       else{
       const user=new User({name, email,profileType,userName,phoneNumber,profileImage,bio,displayName,password,cpassword});
       //    hashing the password before saving
       user.save().then(()=>{
           res.status(201).json({message: "user registered successfully"});
       }).catch((err)=> {
        //    console.log(err);
           return res.status(500).json({err: "user not registered"})});
       
    }
   }).catch((err)=>{console.log(err)});
})


// 2nd User Login


router.post('/user/login',async (req,res)=>{
  try{
    const {email , password}=req.body;
    console.log(req.body);
    if(!email || !password){
        return res.status(400).json({err: "Plz filled the data"});
    }
    const userlogin= await User.findOne({email:email});
    console.log(userlogin);
    if(userlogin){
      const isMatch = bcrypt.compareSync(password,userlogin.password);
      if(!isMatch){
        console.log("yes");
          res.status(400).json({err: "Invalid Credentials"});
      }
      else{
        const token = await userlogin.generateAuthToken();
        res.cookie("jwtoken",token,{
          expires: new Date(Date.now()+2545895000),
          httpOnly: true
        }); 
          res.status(200).json({message: "User Signin successfully"});
      }
    }
    else{
        res.status(400).json({err: "Invalid Credentials"});
    }
  }
  catch(err){
    console.log(err);
  }
})


// 3rd Profile Update


router.patch('/profile/:userid',authorization,(req,res)=>{
  const updates=req.body;
  if(ObjectId.isValid(req.params.userid)){
  User.updateOne({_id: ObjectId(req.params.userid)},{$set: updates})
  .then(result=>{
      res.status(200).json(result);
  })
  .catch(err =>{
      res.status(500).json({error: "enable to update"});
  })
 }
 else{
   res.status(500).json({error: "Invalid doc id"});
 }
})


// 11 user logout api


router.get("/user/logout", authorization, (req, res) => {
  return res
    .clearCookie("jwtoken")
    .status(200)
    .json({ message: "Successfully logged out " });
});




module.exports=router;

