const bcrypt = require('bcrypt');
const Transaction = require('../models/Transaction');
const Service = require('../models/Service');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const axios=require('axios');
const API_URL=process.env.API_URL;
const API_KEY =process.env.API_KEY;

class AdminController{

    async createUser(req, res) {
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
        }
    
        async addBalance(req,res){
            
            const {userId,amount} = req.payload;
            
            if(req.user.role!=='admin'){
                res.status(404).json({msg:"unauthorized"});
            }
            
            try {
                const curr = await User.findOne({ userId });
                if (!curr) {
                    return res.status(404).json({ msg: "User not found" });
                }
                const user = await User.updateOne(
                    { userId },
                    { $set: { money: curr.money + amount } }
                );
                const session = await mongoose.startSession();
                session.startTransaction();
                try {
                    await User.updateOne(
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
                res.status(200).json({ data:req.payload });
            } catch (error) {
                console.log(error);
                res.status(500).json({ msg: "Internal server error", error: error.message });
            }
        }
    
        async addService(req, res) {
            const { userId, serviceId } = req.payload; // Use req.body for POST data
        
        
            if (!userId || !serviceId) {
                return res.status(400).json({ message: 'userId and serviceId are required.' });
            }
        
            try {
                const user = await User.findOne({ userId });
                if (!user) {
                    return res.status(404).json({ message: 'Invalid user.' });
                }
                // Add serviceId if not already present
                if (!user.services.includes(serviceId)) {
                    user.services.push(serviceId);
                    await user.save();
                    res.status(200).json({ message: 'Service added successfully.', user });
                } else {
                    res.status(200).json({ message: 'Service already exists for user.', user });
                }
            } catch (err) {
                res.status(500).json({ message: 'Database error.' });
            }
        }
    
        async removeService(req, res)  {
            const { userId, serviceId } = req.payload;
        
        
            if (!userId || !serviceId) {
                return res.status(400).json({ message: 'userId and serviceId are required.' });
            }
        
            try {
                const user = await User.findOne({ userId });
                if (user) {
                    user.services.pull(serviceId);
                    await user.save();
                }
        
                if (!user) {
                    return res.status(404).json({ message: 'User not found.' });
                }
        
                res.status(200).json({ message: 'Service deleted from user.', user });
            } catch (error) {
                res.status(500).json({ message: 'Server error.', error: error.message });
            }
        }


    async changeUserPassword(req, res){
        try {
            const { userId, newPassword } = req.body;
    
           
            // Check if user is authenticated and is admin
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied' });
            }
    
            // Validate input
            if (!userId || !newPassword) {
                return res.status(400).json({ message: 'userId and password are required' });
            }
    
            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
    
            // Update user's password
            const user = await User.findOneAndUpdate(
                { userId },
                { password: hashedPassword },
                { new: true }
            );
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // Respond with userId and (plain) password as requested
            
            res.status(200).json({ userId, newPassword });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async getUser(req, res){
        try {
            const {userId} = req.payload;
            // Replace with your actual user fetching logic, e.g., from a database
            // const user = await User.findById(userId);
            const user = await User.findOne({userId});
    
            const orders = await Order
                .find({ user: user._id })
                .sort({ createdAt: -1 })
                .limit(10);
    
            const transactions = await Transaction
                .find({ user: user._id })
                .sort({ date: -1 })
                .limit(10);
    
    
            const services = await Service.find({
                serviceId: { $in: user.services || [] }
            });
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({userId,balance:user.money,orders,transactions,services});
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    async createService(req, res)  {
        // Your logic to create a service goes here
        if(req.user.role!=='admin'){
            return res.status(400).json({ error:'you are not a admin' });
        }
    
    
        try {
            const { serviceId, service, name, internalName, rate, min, max, refill } = req.body;
            const serv = new Service({ serviceId, service, name, internalName, rate, min, max, refill});
            await serv.save();
            return res.status(200).json({message: "new Service created", data:{service, serviceId, name, rate, min, max}});
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Failed to create service', details: error.message });
        }
    
    }

    async deleteService(req, res) {
        const { serviceId } = req.payload;
        try {
            // Delete the service
            const deletedService = await Service.findOneAndDelete({ serviceId });
    
            // Remove the service from all users' services array
            if (deletedService) {
                await User.updateMany(
                    { services: { $in: [serviceId] } },
                    { $pull: { services: serviceId } }
                );
            }
            if (!deletedService) {
                return res.status(404).json({ message: 'Service not found' });
            }
            res.json({ message: 'Service deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting service', error: error.message });
        }
    }

    async updateService (req, res) {
        try {
            const {serviceId,min,max,rate,refill}=req.payload;
    
            // Find service by ID and update
            const updateData = { min, max, rate, refill };
            const updatedService = await Service.findOneAndUpdate(
                { serviceId },
                updateData,
                { new: true, runValidators: true }
            );
    
            if (!updatedService) {
                return res.status(404).json({ message: 'Service not found' });
            }
        
    
            res.json({ message: 'Service updated successfully', service: updatedService });
        } catch (error) {
            res.status(500).json({ message: 'Error updating service', error: error.message });
        }
    }

    async getCustomServices(req, res)  {
        try {
            const services = await Service.find({});
            services.push({
                service: 1,
                name:"install followers",
                max:10,
                min:1
            })
            
            res.status(200).json({ data:services });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server Error', error: error.message });
        }
    }

    async getServices(req,res){
        try {
        const response = await axios.post(API_URL, new URLSearchParams({
          key: API_KEY,
          action: 'services'
        }));
    
        res.status(200).json({data:response.data})
      } catch (error) {
        res.status(400).json({msg: error});
      }
    }
    
}

module.exports = new AdminController();