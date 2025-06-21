const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    lastStatus: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refill: {
        type: String,
        default: null
    },
    start_count: {
        type: String,
        required: true
    }
}, { timestamps: true });

// OrderSchema.index({ user: 1 }); // Essential for finding all orders for a user
// OrderSchema.index({ service: 1 }); // For finding orders related to a specific service
// OrderSchema.index({ status: 1 }); // For filtering orders by status
// OrderSchema.index({ user: 1, createdAt: -1 }); // For finding a user's most recent orders
// OrderSchema.index({ orderId: 1 });

module.exports = mongoose.model('Order', OrderSchema);

// Status	Meaning
// Pending	Order is received but not yet started.
// Processing	Order is being fulfilled.
// In Progress	Some services have begun; not fully completed.
// Completed	Order is successfully delivered.
// Partial	Only part of the order could be delivered; remaining refunded.
// Canceled	Order was canceled and no services were delivered.
// Refunded	Payment has been returned to your account balance or method.
// Failed	An error occurred; order could not be processed.