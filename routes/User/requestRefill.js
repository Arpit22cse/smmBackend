const express = require('express');
const axios = require('axios');

require('dotenv').config();

const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { orderId } = req.payload;
        
        if (!orderId) {
            return res.status(400).json({ error: 'OrderId is required' });
        }

        // const response = await axios.post(apiUrl, null, {
        //     params: {
        //         key: apiKey,
        //         action: 'refill',
        //         order: OrderId
        //     }
        // });

        res.status(200).json({refill:"356"});
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

module.exports = router;