const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    rating: { type: Number },
    image_url: { type: String },
    email: { type: String, required: true },
    availability: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    unavailableDates: { type: [String], default: [] }
});

module.exports = mongoose.model('Doctor', doctorSchema);
