const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true,
        unique: true
    },
    service: {
        type: String,
        required: true,
    },
    internalName: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    min:{
        type: String,
        required: true
    },
    max: {
        type: String,
        required: true
    },
    refill: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Service', ServiceSchema);