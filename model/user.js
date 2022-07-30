const mongoose=require("mongoose");
const bcrypt=require('bcryptjs');
const Schema=mongoose.Schema;
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
dotenv.config({path: './config.env'});
const SECRET_KEY=process.env.SECRET_KEY;
const userSchema=Schema({
    name: {
      first: {
        type: String,
        required: true
      },
      last: {
        type: String,
        required: true
      } 
    },
    email: {
        type: String,
        required: true
    },
    profileType: {
        // type: Array,
        // enum: ["one", "two", "three"]
        type: String,
        required: true 
    },
    userName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cpassword: {
        type: String,
        required: true
    },
    tokens: [
        {
            token: {
                type:String,
                required: true
            }
        }
    ]
});


userSchema.pre('save',async function(next){
  if(this.isModified('password')){
       this.password=await bcrypt.hash(this.password,12);
       this.cpassword=await bcrypt.hash(this.cpassword,12);
  }
  next();
})

userSchema.methods.generateAuthToken= async function(){
  try{
      let token=jwt.sign({_id:this.id},process.env.SECRET_KEY);
      this.tokens=this.tokens.concat({token:token});
      await this.save();
      return token;
  }
  catch(err){
   console.log(err);
  }
}

const User=mongoose.model("Users",userSchema);
module.exports=User;
