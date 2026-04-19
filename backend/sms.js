require('dotenv').config();

const sendSMS = (phone, message) => {
    // If user provided a real Twilio API Sid
    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
            const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
            client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            })
            .then(message => console.log(`[LIVE SMS] Sent to ${phone}: ${message.sid}`))
            .catch(err => console.error("[LIVE SMS ERROR]", err));
        } catch (err) {
            console.error("Twilio setup failed:", err);
        }
    } else {
        // Mock SMS system for development
        console.log(`\n================== [MOCK SMS DISPATCH] ==================`);
        console.log(`TO: ${phone}`);
        console.log(`MESSAGE: ${message}`);
        console.log(`=========================================================\n`);
    }
};

module.exports = { sendSMS };
