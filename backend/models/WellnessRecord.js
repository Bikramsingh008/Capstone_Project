const mongoose = require('mongoose');

const wellnessRecordSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mood: { type: String, required: true },           // e.g. Happy, Neutral, Sad, Anxious
    stressLevel: { type: Number, required: true },    // 1-10
    energyLevel: { type: Number, required: true },    // 1-10
    sleepQuality: { type: String },                   // e.g. Good, Fair, Poor
    journalEntry: { type: String },
    riskScore: { type: Number },                      // Generated Predictive Risk Score
    aiFeedback: { type: String },                     // Virtual Psychologist Response
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WellnessRecord', wellnessRecordSchema);
