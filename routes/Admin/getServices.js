require('dotenv').config();
const axios=require('axios');
const express=require('express');
const router=express.Router();
const API_URL=process.env.API_URL;
const API_KEY =process.env.API_KEY;
router.get("/",async(req,res)=>{
    try {
    const response = await axios.post(API_URL, new URLSearchParams({
      key: API_KEY,
      action: 'services'
    }));

    res.status(200).json({data:response.data})
  } catch (error) {
    res.status(400).json({msg: error});
  }
})
module.exports=router;
