const user=require('../../models/User');
const db=require('../../utils/db');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/', async (req, res) => {
    const { userId, password, role, services } = req.payload;

    if (!userId || !password || !role) {
        return res.status(400).json({ error: 'userid, password, and role are required' });
    }

    if(req.user.role!=='admin'){
        return res.status(400).json({ error:'you are not a admin' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new user({
            userId,
            password: hashedPassword,
            role,
            services
        });

        const curr=await newUser.save();
        
        res.status(200).json({userId,password});
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Error creating user' });
    }
});

module.exports = router;