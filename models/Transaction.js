const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

// transactionSchema.index({ user: 1 }); // Essential for finding all transactions for a user
// transactionSchema.index({ user: 1, date: -1 }); // For finding a user's transactions sorted by newest

module.exports = mongoose.model('Transaction', transactionSchema);
