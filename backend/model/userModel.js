import mongoose from "mongoose";
import validator from "validator"

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [
      25,
      "inValid Name , please Enter  a Name with fewer than 25 charaters",
    ],
    minLength: [3, "Name Should contain more than 3 characters"],
  },

  email: {
    type: String,
    required: [true, "Please Enter Your  Valid Email"],
    unique: true,
    validate: [validator.isEmail, "please Enter a Valid email"],
  },

  password: {
    type: String,
    required: true,
    minLength: [8, "more than eight chars"],
    select: false,
  },

  role: {
    type: String,
    default: "user",
  }
},{timestamps:true});

 export default mongoose.model("User",userSchema);
