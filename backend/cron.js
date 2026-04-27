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
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];

        console.log(`[CRON TICK] Checking medication schedules for exact time: ${currentTime} on ${currentDay}...`);

        try {
            // Find medications where the times array contains the current time (or legacy time equals current time)
            const medications = await Medication.find({
                $or: [
                    { times: currentTime },
                    { time: currentTime }
                ]
            }).populate('user_id');

            if (medications.length > 0) {
                // Filter weekly medications by the current day
                const validMedications = medications.filter(med => {
                    if (med.frequency === 'Weekly') {
                        return med.dayOfWeek === currentDay;
                    }
                    return true; // Daily, Twice a Day, or As Needed (if they had a time)
                });

                if (validMedications.length > 0) {
                    console.log(`[CRON FIRE] Found ${validMedications.length} medication(s) matching exactly ${currentTime}. Dispatching protocols...`);
                    
                    validMedications.forEach(med => {
                        if (!med.user_id) return;
                        
                        let scheduleDetails = `Frequency: ${med.frequency}`;
                        if (med.frequency === 'Weekly') scheduleDetails += ` on ${med.dayOfWeek}`;
                        
                        const message = `PAGING ${med.user_id.username.toUpperCase()}! It is exactly ${currentTime}. Time to take your medication: \n\nMedicine: ${med.name} (${med.dosage})\n${scheduleDetails}\n\nPlease consume your medication immediately and log any symptoms in your Arogya Dashboard!`;

                        mailer.sendNotification(
                            med.user_id.email,
                            "URGENT: Time To Take Your Medication! [Arogya System]",
                            message
                        );

                        sms.sendSMS(
                            med.user_id.phone,
                            message
                        );
                    });
                }
            }
        } catch (err) {
            console.error("[CRON DB ERROR]", err);
        }
    });
}

module.exports = { startCronJobs };
