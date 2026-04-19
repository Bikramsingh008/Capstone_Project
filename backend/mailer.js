require('dotenv').config();
const nodemailer = require('nodemailer');

let transporter;

async function initMailer() {
    // If environment variables exist, use Live Gmail
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            console.log("Live Gmail SMTP System Ready.");
        } catch (err) {
            console.error("Failed to setup Live Gmail mailer:", err);
        }
    } else {
        // Fallback to Developer Mock Email System
        try {
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, 
                auth: {
                    user: testAccount.user, 
                    pass: testAccount.pass, 
                },
            });
            console.log("Mock Email System ready. Using Ethereal.");
            console.log("Waiting for EMAIL_USER and EMAIL_PASS to be set in .env for Live Email.");
        } catch (err) {
            console.error("Failed to setup Mock Ethereal mailer:", err);
        }
    }
}

initMailer();

const sendNotification = async (to, subject, text) => {
    if (!transporter) {
        console.log("Transporter not ready yet.");
        return;
    }
    
    try {
        let info = await transporter.sendMail({
            from: `"Arogya AI Healthcare" <${process.env.EMAIL_USER || 'no-reply@arogya.test'}>`,
            to,
            subject,
            text,
        });

        console.log("Message sent: %s", info.messageId);
        
        // If it's the mock system, we print the preview URL. 
        if (!process.env.EMAIL_USER) {
            console.log("Mail Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (err) {
        console.error("Error sending mail:", err);
    }
}

module.exports = {
    sendNotification
};
