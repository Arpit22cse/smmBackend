const express = require('express');
require('dotenv').config();
const router = express.Router();
const axios = require('axios');

const apiKey = process.env.API_KEY;
const apiUrl = process.env.API_URL;

router.post('/', async (req, res) => {
    const apiKey = process.env.API_KEY;
    const refill = req.payload.orderId;
    

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    // Example: Replace with actual API endpoint
    try {
        // const response = await axios.get(`${apiUrl}`, {
        //     params: {
        //         key: apiKey,
        //         action: 'refill_status',
        //         refill: refill
        //     }
        // });
        res.status(200).json({status:'Completed'});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch refill status' });
    }
});

module.exports = router;