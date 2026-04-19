const express = require('express');
const cors = require('cors');
const db = require('./database');
const mailer = require('./mailer');
const sms = require('./sms');
const cronWorkers = require('./cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize continuous background processing logic
cronWorkers.startCronJobs();

app.use(cors());
app.use(express.json());

// User Authentication API
app.post('/api/users/signup', (req, res) => {
    const { username, email, phone, password, gender, age, weight, height, bmi, bloodGroup } = req.body;
    db.run(
        `INSERT INTO users (username, email, phone, password, gender, age, weight, height, bmi, bloodGroup) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, phone, password, gender, age, weight, height, bmi, bloodGroup],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Signup successful', userId: this.lastID });
        }
    );
});

app.post('/api/users/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });
        res.json({ message: 'Login successful', user: row });
    });
});

app.put('/api/users/:id', (req, res) => {
    const { email, phone, gender, age, weight, height, bmi, systolic, diastolic, bloodGroup, happinessLevel, feeling, stressLevel, sleepQuality } = req.body;
    const { id } = req.params;

    db.run(
        `UPDATE users SET 
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            gender = COALESCE(?, gender),
            age = COALESCE(?, age),
            weight = COALESCE(?, weight),
            height = COALESCE(?, height),
            bmi = COALESCE(?, bmi),
            bloodGroup = COALESCE(?, bloodGroup)
         WHERE id = ?`,
        [email, phone, gender, age, weight, height, bmi, bloodGroup, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Profile updated successfully', user: row });
            });
        }
    );
});

// API endpoints for Doctors
app.get('/api/doctors', (req, res) => {
    const { location } = req.query;
    let query = 'SELECT * FROM doctors';
    let params = [];
    
    if (location) {
        query += ' WHERE location LIKE ?';
        params = [`%${location}%`];
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API endpoints for Appointments
app.post('/api/appointments', (req, res) => {
    const { userId, email, phone, doctorId, doctorName, date, time } = req.body;
    
    db.run('INSERT INTO appointments (user_id, doctor_id, date, time) VALUES (?, ?, ?, ?)', 
        [userId || 1, doctorId, date, time],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Send Notification using dynamic email
            if (email) {
                mailer.sendNotification(
                    email,
                    "Appointment Confirmed: Arogya AI Healthcare",
                    `Your doctor appointment with ${doctorName || 'a specialist'} has been scheduled for ${date} at ${time}.`
                );
            }
            if (phone) {
                sms.sendSMS(phone, `Arogya Notification: Your doctor appointment with ${doctorName} is confirmed for ${date} at ${time}.`);
            }

            res.json({ message: 'Appointment booked successfully', appointmentId: this.lastID });
        }
    );
});

// Mocked AI Chat Endpoint
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    
    // Simulate AI delay and response
    setTimeout(() => {
        const lowerMessage = message.toLowerCase();
        let reply = "I am your AI Healthcare assistant. I can help interpret symptoms, remind you about medications, and answer general health queries. However, I am not a replacement for a professional doctor.";
        
        if (lowerMessage.includes('headache')) {
            reply = "For a headache, ensure you are drinking plenty of water and getting enough rest. If it persists, you might consider taking over-the-counter pain relievers or booking an appointment with a doctor.";
        } else if (lowerMessage.includes('fever')) {
            reply = "A fever could indicate an infection. Please monitor your temperature. Drink fluids, and if it exceeds 103°F (39.4°C) or lasts over 3 days, consult a physician immediately.";
        } else if (lowerMessage.includes('report') || lowerMessage.includes('pdf')) {
            reply = "You can generate a comprehensive health report and download it as a PDF from the 'My Health Reports' tab on your dashboard.";
        }
        
        res.json({ reply });
    }, 1000);
});

// Mocked AI Health Report Generator Endpoint
app.post('/api/reports', (req, res) => {
    const { userId, symptoms } = req.body;
    
    setTimeout(() => {
        // Generate a mock report
        const aiAnalysis = `Based on your symptoms (${symptoms}), our AI model suggests monitoring your condition carefully.
Possible factors: Stress, lack of sleep, or minor viral infection.
Recommendations:
- Rest for at least 8 hours a day.
- Maintain a balanced diet.
- Book a general physician checkup if symptoms persist.
*** This is an AI-generated report and not medical advice ***`;
        
        db.run('INSERT INTO reports (user_id, symptoms, ai_analysis) VALUES (?, ?, ?)',
            [userId || 1, symptoms, aiAnalysis],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ 
                    message: 'Report generated successfully', 
                    report: {
                        id: this.lastID,
                        user_id: userId || 1,
                        symptoms,
                        ai_analysis: aiAnalysis,
                        created_at: new Date().toISOString()
                    }
                });
            }
        );
    }, 2000); // 2 second delay to simulate analysis
});

// Fetch historical reports
app.get('/api/reports/:userId', (req, res) => {
    db.all('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId || 1], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Medications APIs
app.get('/api/medications/:userId', (req, res) => {
    db.all('SELECT * FROM medications WHERE user_id = ?', [req.params.userId || 1], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/medications', (req, res) => {
    const { userId, email, phone, name, dosage, frequency, time } = req.body;
    db.run('INSERT INTO medications (user_id, name, dosage, frequency, time) VALUES (?, ?, ?, ?, ?)',
        [userId || 1, name, dosage, frequency, time],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Send Notification dynamically
            if (email) {
                mailer.sendNotification(
                    email, 
                    "Medication Schedule Configured: Arogya AI Healthcare",
                    `You have successfully configured a new medication reminder. \n\nMedicine: ${name} (${dosage})\nFrequency: ${frequency}\nTime: ${time}\n\nPlease take your medication on time.`
                );
            }
            if (phone) {
                sms.sendSMS(phone, `Arogya Notification: Medication Schedule for ${name} at ${time} is recorded successfully.`);
            }

            res.json({ message: 'Medication added successfully', medicationId: this.lastID });
        }
    );
});

app.delete('/api/medications/:id', (req, res) => {
    db.run('DELETE FROM medications WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Medication removed' });
    });
});

// Wellness Tips Mocked API
app.get('/api/wellness', (req, res) => {
    const tips = [
        { id: 1, category: 'Nutrition', title: 'Eat the Rainbow', description: 'Include a variety of colorful fruits and vegetables in your diet for essential vitamins.', icon: '🥗' },
        { id: 2, category: 'Sleep', title: 'Maintain a Schedule', description: 'Go to bed and wake up at the same time every day to regulate your circadian rhythm.', icon: '😴' },
        { id: 3, category: 'Exercise', title: 'Stay Active', description: 'Aim for at least 30 minutes of moderate physical activity every day.', icon: '🏃' },
        { id: 4, category: 'Hydration', title: 'Drink Water', description: 'Drink at least 8 glasses of water a day to stay hydrated and energetic.', icon: '💧' },
        { id: 5, category: 'Mental Health', title: 'Practice Mindfulness', description: 'Take 5 minutes a day for deep breathing or meditation to reduce stress.', icon: '🧘' }
    ];
    res.json(tips);
});

app.listen(PORT, () => {
    console.log(`Healthcare Backend listening on port ${PORT}`);
});
