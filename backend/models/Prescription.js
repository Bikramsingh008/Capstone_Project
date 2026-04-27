const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image_data: { type: String, required: true }, // Base64 string of the image
    ai_description: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
