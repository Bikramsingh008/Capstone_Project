const cron = require('node-cron');
const mailer = require('./mailer');
const sms = require('./sms');
const Medication = require('./models/Medication');

function startCronJobs() {
    console.log("Cron Scheduler Initialized. Waiting for triggers...");

    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        console.log(`[CRON TICK] Checking medication schedules for exact time: ${currentTime}...`);

        try {
            const medications = await Medication.find({ time: currentTime }).populate('user_id');

            if (medications.length > 0) {
                console.log(`[CRON FIRE] Found ${medications.length} medication(s) matching exactly ${currentTime}. Dispatching protocols...`);
                
                medications.forEach(med => {
                    if (!med.user_id) return;
                    
                    const message = `PAGING ${med.user_id.username.toUpperCase()}! It is exactly ${currentTime}. Time to take your medication: \n\nMedicine: ${med.name} (${med.dosage})\nFrequency: ${med.frequency}\n\nPlease consume your medication immediately and log any symptoms in your Arogya Dashboard!`;

                    mailer.sendNotification(
                        med.user_id.email,
                        "URGENT: Time To Take Your Medication! [Arogya System]",
                        message
                    );

                    sms.sendSMS(
                        med.user_id.phone,
                        `Arogya Med-Alert for ${med.user_id.username}! Time to take your ${med.name} (${med.dosage}) right now!`
                    );
                });
            }
        } catch (err) {
            console.error("[CRON DB ERROR]", err);
        }
    });
}

module.exports = { startCronJobs };
