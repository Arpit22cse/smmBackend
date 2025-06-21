const express=require('express');
const router=express.Router();
const bcrypt=require('bcrypt');
const db=require('../../utils/db');
router.put("/",async(req,res)=>{
    console.log(req.payload)
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const userRecord = await db.collection('users').findOne({ userId });
        if (!userRecord) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, userRecord.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Current password is incorrect" });
        }


        const Password = await bcrypt.hash(req.newPassword, 10);

        const user = await db.collection('users').updateOne(
            { userId },
            { $set: { password: newPassword } }
        );
        

        res.status(200).json({});
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }

});
module.exports=router;