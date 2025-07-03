const express=require('express');
const axios =require('axios');
const router=express.Router();
const db=require('../../utils/db');
require('dotenv').config();
const Order=require('../../models/Order');
const Transaction = require('../../models/Transaction');
const apiKey=process.env.API_KEY;
const apiUrl=process.env.API_URL;
router.post("/", async (req, res) => {
  try {

    const response = await axios.post(apiUrl, new URLSearchParams({
        key: apiKey,
        action: 'services'
    }));

    const services = response.data;
    
    const selectedService = services.filter(s => s.service === req.body.service);

    if (!selectedService) {
      return res.status(400).json({ msg: "Service not found" });
    }

    if (req.body.rate < selectedService.rate) {
      return res.status(400).json({ msg: "Service is under maintenance" });
    }

    const refill = (req.body.refill)?"":null;

    //Use a transaction to prevent race conditions and balance losses
    const session = await db.client.startSession();
    let orderId, status;
    try {
      await session.withTransaction(async () => {
      const { serviceId, service, linkInput, quantity, rate, totalAmount } = req.body;
      const link = linkInput;

      // Re-check balance inside transaction
      const freshUser = await db.collection('users').findOne({ userId: req.user.id }, { session });
      if (!freshUser || freshUser.money < totalAmount) {
        throw new Error("Insufficient balance");
      }

      // Deduct the amount from user's balance
      await db.collection('users').updateOne(
        { userId: req.user.id },
        { $inc: { money: -totalAmount } },
        { session }
      );

      const params = {
        key: apiKey,
        action: 'add',
        service: service,
        link: link,
        quantity: quantity,
      };

      // Place order via external API
      const orderResponse = await axios.post(apiUrl, null, { params });
      orderId = orderResponse.data.order || null;

      // If orderId is not present, throw an error
      if (!orderId) {
        throw new Error("Order could not be placed. because order already present with this link");
      }
      

      // Get order status
      const statusParams = {
        key: apiKey,
        action: 'status',
        order: orderId
      };
      const statusResponse = await axios.post(apiUrl, null, { params: statusParams });
      status = statusResponse.data.status || "pending";
      
      
      const newOrder = new Order({
        orderId: orderId,
        lastStatus: status,
        quantity,
        rate,
        service: serviceId,
        user: freshUser._id,
        start_count: statusResponse.data.start_count,
        refill
      });
      await newOrder.save({ session });

      // Save the transaction
      const newTransaction = new Transaction({
        user: freshUser._id,
        amount: -totalAmount,
        orderId: orderId,
      });
      await newTransaction.save({ session });
      });
    } finally {
      await session.endSession();
    }

    res.status(200).json({ msg: "Order placed successfully", orderId:orderId, status:status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to place order", error: error.message });
  }
});
module.exports=router;