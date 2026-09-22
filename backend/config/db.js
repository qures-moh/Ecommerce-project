const mongoose=require("mongoose");
const connectDb=async()=>{
    try{
   await mongoose.connect(process.env.MONGO_URI);
   console.error("mongodb connected");
    }catch(error){
          console.error("MongoDB connection failed:", error.message);
    }
};
module.exports=connectDb;

