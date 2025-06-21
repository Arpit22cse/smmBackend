const express=require('express');
const router=express.Router();
const db=require('../../utils/db');
const axios=require('axios');
require('dotenv').config();
const API_URL=process.env.API_URL;
const API_KEY=process.env.API_KEY;
router.get("/",async(req,res)=>{
    try {
        // Example query, replace with your actual logic
        // Fetch the user from the database
        
        const user = await db.collection('users').findOne({ userId: req.user.id });

        // Fetch all services from the external API
        const userServiceIds = user.services || [];
        
        const allServices = await db.collection('services').find().toArray();
        
        const arr = allServices.filter(service => userServiceIds.includes(service.serviceId));
        
        
        // Respond with the filtered services
        res.status(200).json({ data: arr });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})
module.exports=router;