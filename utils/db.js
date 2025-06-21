const mongoose=require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URI;
mongoose.connect(uri).then(()=>{
    console.log("cluster connected");
}).catch(err=>console.log(err)
);
const db=mongoose.connection;
module.exports=db;
