require('dotenv').config();
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Service = require('../models/Service');
const User = require('../models/User');
const axios = require('axios');
const mongoose = require('mongoose');
const db = require('../utils/db');
const API_URL=process.env.API_URL;
const API_KEY =process.env.API_KEY;
const bcrypt = require('bcrypt')
class UserController {

    async changePassword(req, res) {
        
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            const userRecord = await User.findOne({ userId });
            if (!userRecord) {
                return res.status(404).json({ msg: "User not found" });
            }

            const isMatch = await bcrypt.compare(currentPassword, userRecord.password);
            if (!isMatch) {
                return res.status(400).json({ msg: "Current password is incorrect" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await User.updateOne(
                { userId },
                { $set: { password: hashedPassword } }
            );

            res.status(200).json({ newPassword });
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({ msg: "Internal server error", error: error.message });
        }
    }

    async getUserService(req, res) {
        try {
            const user = await User.findOne({ userId: req.user.id });

            const userServiceIds = user?.services || [];
            
            const allServices = await Service.find();
            
            const filteredServices = allServices.filter(service => userServiceIds.includes(service.serviceId));
            
            res.status(200).json({ data: filteredServices });

        } catch (error) {
            console.error('Error fetching user services:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    async getTransactions(req, res) {
        try {
            const userId = req.user.id;

            const page = parseInt(req.query['page[page]'] || '1');
            const limit = parseInt(req.query['page[limit]'] || '10');
            const skip = (page - 1) * limit;

            const user = await User.findOne({ userId });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const userObjectId = user._id;

            const payments = await Transaction
                                   .find({ user: userObjectId })
                                   .sort({ date: -1 })
                                   .skip(skip)
                                   .limit(limit);

            res.status(200).json({ success: true, data: payments });

        } catch (error) {
            console.error('Error fetching payments:', error);
            res.status(500).json({ success: false, message: 'Server error: An error occurred while fetching payments' });
        }
    }

    async placeOrder(req, res) {
        const session = await mongoose.startSession();
        let orderId, status;

        try {
            await session.withTransaction(async () => {
                const apiServicesResponse = await axios.post(API_URL, new URLSearchParams({
                    key: API_KEY,
                    action: 'services'
                }));
                const externalServices = apiServicesResponse.data;

                const selectedServiceExternal = externalServices.find(s => s.service === req.body.service);

                if (!selectedServiceExternal) {
                    throw new Error("Service not found");
                }

                if (req.body.rate < selectedServiceExternal.rate) {
                    throw new Error("Service is under maintenance or rate is too low");
                }

                const refillOption = req.body.refill ? "" : null;

                const { serviceId, service, linkInput, quantity, rate, totalAmount } = req.body;
                const link = linkInput;

                const freshUser = await User.findOne({ userId: req.user.id }).session(session);
                if (!freshUser || freshUser.money < totalAmount) {
                    throw new Error("Insufficient balance");
                }

                await User.updateOne(
                    { userId: req.user.id },
                    { $inc: { money: -totalAmount } }
                ).session(session);

                const params = {
                    key: API_KEY,
                    action: 'add',
                    service: service,
                    link: link,
                    quantity: quantity,
                };

                const orderResponse = await axios.post(API_URL, null, { params });
                orderId = orderResponse.data.order || null;

                if (!orderId) {
                    throw new Error("Order could not be placed. because order already present with this link");
                }

                const statusParams = {
                    key: API_KEY,
                    action: 'status',
                    order: orderId
                };
                const statusResponse = await axios.post(API_URL, null, { params: statusParams });
                status = statusResponse.data.status || "pending";

                const newOrder = new Order({
                    orderId: orderId,
                    lastStatus: status,
                    quantity,
                    rate,
                    service: serviceId,
                    user: freshUser._id,
                    start_count: statusResponse.data.start_count,
                    refill: refillOption
                });
                await newOrder.save({ session });

                const newTransaction = new Transaction({
                    user: freshUser._id,
                    amount: -totalAmount,
                    orderId: orderId,
                });
                await newTransaction.save({ session });
            });

            res.status(200).json({ msg: "Order placed successfully", orderId: orderId, status: status });
        } catch (error) {
            console.error('Error placing order:', error);
            res.status(500).json({ msg: "Failed to place order", error: error.message });
        } finally {
            await session.endSession();
        }
    }

    async getOrders(req, res) {
        try {
            const userId = req.user.id;

            const page = parseInt(req.query['page[page]'] || '1');
            const limit = parseInt(req.query['page[limit]'] || '10');
            const skip = (page - 1) * limit;

            const user = await User.findOne({ userId });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const userObjectId = user._id;

            const orders = await Order
                                   .find({ user: userObjectId })
                                   .sort({ createdAt: -1 })
                                   .skip(skip)
                                   .limit(limit);

            res.status(200).json({ success: true, data: orders });

        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ success: false, message: 'Server error: An error occurred while fetching orders' });
        }
    }

    async getOrderStatus(req, res) {
        const { order } = req.body;
        if (!order) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        try {
            const response = await axios.post(API_URL, {
                key: API_KEY,
                action: 'status',
                order
            });

            const updatedOrder = await Order.findOneAndUpdate(
                { orderId: order },
                {
                    $set: {
                        lastStatus: response.data.status,
                        start_count: response.data.start_count
                    }
                },
                { returnDocument: 'after' }
            );

            if (updatedOrder.value) {
                response.data.charge = updatedOrder.value.quantity * updatedOrder.value.rate;
            } else {
                response.data.charge = 0;
            }

            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error fetching order status:', error);
            res.status(500).json({ error: 'Failed to fetch order status', details: error.message });
        }
    }

    async requestRefill(req, res) {
        try {
            const { orderId } = req.payload;
            
            if (!orderId) {
                return res.status(400).json({ error: 'Order ID is required' });
            }

            const response = await axios.post(API_URL, null, {
                params: {
                    key: API_KEY,
                    action: 'refill',
                    order: orderId
                }
            });

            await Order.findOneAndUpdate(
                { orderId },
                { $set: { refill: response.data.refill } }
            );
            
            if (response.data && response.data.error) {
                return res.status(400).json({ message: response.data.error });
            }
            
            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error requesting refill:', error);
            res.status(500).json({ error: error.response ? error.response.data : error.message });
        }
    }

    async requestRefillStatus(req, res) {
        try {
            const { orderId } = req.payload;

            if (!orderId) {
                return res.status(400).json({ error: 'Order ID is required' });
            }

            if (!API_KEY) {
                return res.status(500).json({ error: 'API key not configured' });
            }

            const response = await axios.get(API_URL, {
                params: {
                    key: API_KEY,
                    action: 'refill_status',
                    refill: orderId
                }
            });

            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error requesting refill status:', error);
            res.status(500).json({ error: 'Failed to fetch refill status', details: error.message });
        }
    }
}

module.exports = new UserController();