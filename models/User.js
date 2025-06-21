const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    money: { type: Number, default: 0 },
    role: { type: String, required: true },
    services: [{
        type: String
    }]
});

module.exports = mongoose.model('User', UserSchema);