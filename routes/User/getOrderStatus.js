const express = require('express');
const axios = require('axios');
const db = require('../../utils/db');

require('dotenv').config();


const apiKey = process.env.API_KEY;
const apiUrl = process.env.API_URL;

const router = express.Router();

router.post('/', async (req, res) => {
    const { order } = req.body;
    if (!order) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
        const response = await axios.post(apiUrl, {
            key: apiKey,
            action: 'status',
            order
        });

        //Here you would update the order's last status in your database
        //Example: await OrderModel.updateStatus(order, response.data);
        const Order = await db.collection('orders').findOneAndUpdate(
            { orderId: order },
            { 
            $set: { 
                lastStatus: response.data.status,
                start_count: response.data.start_count
            } 
            },
            { returnDocument: 'after' }
        );
        
        response.data.charge = Order.quantity * Order.rate;

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order status', details: error.message });
    }
});

module.exports = router;