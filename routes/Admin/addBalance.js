const express=require('express');
const db=require('../../utils/db');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Transaction = require('../../models/Transaction');
const router=express.Router();
router.put("/",async(req,res)=>{
    
    const {userId,amount} = req.payload;
    
    if(req.user.role!=='admin'){
        res.status(404).json({msg:"unauthorized"});
    }
    let curr;
    try {
        curr = await db.collection('users').findOne({ userId });
        if (!curr) {
            return res.status(404).json({ msg: "User not found" });
        }
        const user = await db.collection('users').updateOne(
            { userId },
            { $set: { money: curr.money + amount } }
        );
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            await db.collection('users').updateOne(
            { userId },
            { $set: { money: curr.money + amount } },
            { session }
            );
            await Transaction.create([{
            amount,
            orderId: uuidv4(),
            user: curr._id,
            }], { session });
            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
        session.endSession();
        res.status(200).json({ user:curr });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
})
module.exports=router;