const cron = require('node-cron');
const db = require('./database');
const mailer = require('./mailer');
const sms = require('./sms');

function startCronJobs() {
    console.log("Cron Scheduler Initialized. Waiting for triggers...");

    // Run every minute
    cron.schedule('* * * * *', () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        console.log(`[CRON TICK] Checking medication schedules for exact time: ${currentTime}...`);

        // Query medications alongside user contact info
        const query = `
            SELECT m.name, m.dosage, m.frequency, m.time, u.email, u.phone, u.username
            FROM medications m
            JOIN users u ON m.user_id = u.id
            WHERE m.time = ?
        `;

        db.all(query, [currentTime], (err, rows) => {
            if (err) {
                console.error("[CRON DB ERROR]", err);
                return;
            }

            if (rows.length > 0) {
                console.log(`[CRON FIRE] Found ${rows.length} medication(s) matching exactly ${currentTime}. Dispatching protocols...`);
                
                rows.forEach(scheduledMedication => {
                    const message = `PAGING ${scheduledMedication.username.toUpperCase()}! It is exactly ${currentTime}. Time to take your medication: \n\nMedicine: ${scheduledMedication.name} (${scheduledMedication.dosage})\nFrequency: ${scheduledMedication.frequency}\n\nPlease consume your medication immediately and log any symptoms in your Arogya Dashboard!`;

                    // Dispatch Automations natively into network streams
                    mailer.sendNotification(
                        scheduledMedication.email,
                        "URGENT: Time To Take Your Medication! [Arogya System]",
                        message
                    );

                    sms.sendSMS(
                        scheduledMedication.phone,
                        `Arogya Med-Alert for ${scheduledMedication.username}! Time to take your ${scheduledMedication.name} (${scheduledMedication.dosage}) right now!`
                    );
                });
            }
        });
    });
}

module.exports = { startCronJobs };
