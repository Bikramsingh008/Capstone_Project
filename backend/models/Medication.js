const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    times: { type: [String], required: true },
    dayOfWeek: { type: String, required: false },
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medication', medicationSchema);
