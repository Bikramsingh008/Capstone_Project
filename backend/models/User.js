const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String },
    age: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    bmi: { type: Number },
    bloodGroup: { type: String },
    symptoms: { type: [String], default: [] },
    symptomDuration: { type: String },
    symptomIntensity: { type: Number },
    happinessLevel: { type: Number },
    feeling: { type: String },
    stressLevel: { type: String },
    sleepQuality: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
