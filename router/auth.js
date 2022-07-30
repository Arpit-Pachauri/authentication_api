const express=require('express');
const User = require( '../model/user' );
const router = express.Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
router.use(express.json());    


// post request using promises

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

// post request using async await

router.post('/user/login',async (req,res)=>{
  try{
    const {email , password}=req.body;
    console.log(req.body);
    if(!email || !password){
        return res.status(400).json({err: "Plz filled the data"});
    }
    const userlogin= await User.findOne({email:email});
    // console.log(userlogin);
    if(userlogin){
      const isMatch = bcrypt.compareSync(password,userlogin.password);
      if(!isMatch){
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



module.exports=router;

