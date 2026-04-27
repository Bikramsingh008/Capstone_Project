require('dotenv').config();
const axios = require('axios');

const sendSMS = async (phone, message) => {
    // Message is now formatted identically to the email before being passed to this function.

    // If phone is missing, use the default test number the user requested
    let originalPhone = phone;
    if (!originalPhone) {
        console.warn("[SMS WARNING] Phone number is missing. Falling back to test number 7983843922.");
        originalPhone = "7983843922";
    }

    // Twilio requires E.164 format (e.g. +91...). Auto-format if user just entered 10 digits.
    let formattedPhone = originalPhone;
    if (formattedPhone) {
        formattedPhone = String(formattedPhone).trim();
        if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone;
        }
    }

    let smsSent = false;

    // Check if user provided API Keys
    if (process.env.TWILIO_API_KEY && process.env.TWILIO_API_SECRET && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_PHONE_NUMBER) {
        try {
            const client = require('twilio')(process.env.TWILIO_API_KEY, process.env.TWILIO_API_SECRET, { accountSid: process.env.TWILIO_ACCOUNT_SID });
            const result = await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhone
            });
            console.log(`\n[SUCCESS] Twilio SMS Sent to ${formattedPhone}: ${result.sid}\n`);
            smsSent = true;
        } catch (err) {
            console.error(`\n[TWILIO SMS REJECTED] Twilio servers blocked the SMS.`);
            console.error(`Reason: ${err.message}`);
            console.error(`Please verify your Twilio Account SID, Auth Token/API Key, and Sender Phone Number in the .env file.\n`);
        }
    } else if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        // Fallback to legacy master auth token logic
        try {
            const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
            const result = await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhone
            });
            console.log(`\n[SUCCESS] Twilio SMS Sent to ${formattedPhone}: ${result.sid}\n`);
            smsSent = true;
        } catch (err) {
            console.error(`\n[TWILIO SMS REJECTED] Twilio servers blocked the SMS.`);
            console.error(`Reason: ${err.message}`);
            console.error(`Please verify your Twilio Account SID, Auth Token, and Sender Phone Number in the .env file.\n`);
        }
    }

    if (smsSent) return;

    // If no Twilio credentials or Twilio failed, try TextBelt fallback
    console.log(`\n================== [FREE SMS DISPATCH] ==================`);
    console.log(`Attempting to send real SMS to: ${formattedPhone} via TextBelt...`);
    try {
        const response = await axios.post('https://textbelt.com/text', {
            phone: formattedPhone,
            message: message,
            key: 'textbelt' // Free quota key
        });

        if (response.data.success) {
            console.log(`[SUCCESS] SMS sent successfully to ${formattedPhone}! (Free quota remaining: ${response.data.quotaRemaining})`);
            smsSent = true;
        } else {
            console.error(`[SMS FAILED] TextBelt Error: ${response.data.error}`);
            console.log(`Note: If you are seeing 'Out of quota' or 'Disabled', you MUST provide valid Twilio credentials in your .env file to send SMS.`);
        }
    } catch (err) {
        console.error("[SMS ERROR] Request failed: ", err.message);
    }
    console.log(`=========================================================\n`);

    if (!smsSent) {
        // Mock SMS system for development
        console.log(`\n================== [MOCK SMS DISPATCH] ==================`);
        console.log(`TO: ${formattedPhone}`);
        console.log(`MESSAGE: ${message}`);
        console.log(`=========================================================\n`);
    }
};

module.exports = { sendSMS };
