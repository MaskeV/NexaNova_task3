const mongoose = require('mongoose');
require('dotenv').config();

connectDB = async()=>{
  try{
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log("connected to database successfully");
   }catch(error){
      console.log(error.message);
      process.exit(1);
   }
   
}

module.exports = connectDB;

