require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mailer = require('./mailer');
const sms = require('./sms');
const cronWorkers = require('./cron');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Models
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Report = require('./models/Report');
const Medication = require('./models/Medication');
const WellnessRecord = require('./models/WellnessRecord');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize continuous background processing logic
cronWorkers.startCronJobs();

app.use(cors());
app.use(express.json());

// Users API
app.post('/api/users/signup', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        
        // SMS Notification for account creation
        if (newUser.phone) {
            sms.sendSMS(newUser.phone, `Welcome to Arogya Healthcare, ${newUser.username}! Your account has been created successfully.`);
        }

        res.json({ message: 'Signup successful', userId: newUser._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        // Notification for successful login
        if (user.phone) {
            sms.sendSMS(user.phone, `Arogya Notification: Successful login to your account. If this wasn't you, please secure your account.`);
        }
        if (user.email) {
            mailer.sendNotification(user.email, "Login Alert: Arogya AI Healthcare", `Successful login to your account. If this wasn't you, please secure your account.`);
        }

        res.json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Doctors API & Geolocation logic (FR-14)
app.get('/api/doctors', async (req, res) => {
    try {
        const { location, specialization } = req.query;
        let filter = {};
        if (location) filter.location = { $regex: new RegExp(location, 'i') };
        if (specialization) filter.specialization = { $regex: new RegExp(specialization, 'i') };

        let doctors = await Doctor.find(filter);

        if (doctors.length === 0 && location) {
            // Seed mock doctors if none exist for demo
            const displayLoc = location.trim().charAt(0).toUpperCase() + location.trim().slice(1);
            const genericSpec = specialization || 'General Physician';
            
            const mockDoctors = [
                { name: 'Dr. R. K. Sharma', specialization: genericSpec, location: displayLoc, phone: '+91-9876543210', address: `Central Clinic, ${displayLoc}`, rating: 4.8, image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80' },
                { name: 'Dr. Anita Desai', specialization: 'Cardiologist', location: displayLoc, phone: '+91-9876543211', address: `City Heart Center, ${displayLoc}`, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1594824436998-d50d6ff71c6d?w=300&q=80' },
                { name: 'Dr. Vikram Singh', specialization: 'Neurologist', location: displayLoc, phone: '+91-9876543212', address: `Brain & Spine Institute, ${displayLoc}`, rating: 4.7, image_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&q=80' },
                { name: 'Dr. Meera Patel', specialization: 'Dermatologist', location: displayLoc, phone: '+91-9876543213', address: `Skin Glow Care, ${displayLoc}`, rating: 4.6, image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80' },
                { name: 'Dr. Rahul Verma', specialization: 'Pediatrician', location: displayLoc, phone: '+91-9876543214', address: `Kids Health Clinic, ${displayLoc}`, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1612349317150-e410f624c427?w=300&q=80' }
            ];

            doctors = await Doctor.insertMany(mockDoctors);
            
            if (specialization) {
                 doctors = doctors.filter(d => d.specialization.toLowerCase().includes(specialization.toLowerCase() || ''));
            }
        }
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Appointments API (FR-15)
app.post('/api/appointments', async (req, res) => {
    try {
        const { userId, email, phone, doctorId, doctorName, date, time } = req.body;
        const newAppointment = new Appointment({
            user_id: userId, doctor_id: doctorId, date, time
        });
        await newAppointment.save();

        if (email) {
            mailer.sendNotification(email, "Appointment Confirmed: Arogya AI Healthcare", `Your doctor appointment with ${doctorName || 'a specialist'} has been scheduled for ${date} at ${time}.`);
        }
        if (phone) {
            sms.sendSMS(phone, `Arogya Notification: Your doctor appointment with ${doctorName} is confirmed for ${date} at ${time}.`);
        }

        res.json({ message: 'Appointment booked successfully', appointmentId: newAppointment._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/appointments/:userId', async (req, res) => {
    try {
         const appointments = await Appointment.find({ user_id: req.params.userId }).populate('doctor_id');
         res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Chatbot (Gemini Integration) (FR-6, FR-13, FR-16)
app.post('/api/chat', async (req, res) => {
    try {
        const { message, userId } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        let context = "You are Arogya, an empathetic AI Healthcare Assistant.";
        if (userId) {
             const user = await User.findById(userId);
             if (user) {
                 context += ` You are speaking to ${user.username}, age ${user.age}.`;
             }
        }
        context += ` 
        If they mention severe symptoms, recommend emergency support (FR-16).
        If they mention regular symptoms, suggest an appropriate doctor specialization so they can search for it (FR-13).
        Keep your advice helpful, concise and clear that you are AI not a real doctor.
        `;

        const prompt = `${context}\n\nUser: ${message}\nAssistant:`;
        const result = await model.generateContent(prompt);
        const reply = result.response.text();
        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'AI Error: ' + err.message });
    }
});

// AI Report Generation (FR-8)
app.post('/api/reports', async (req, res) => {
    try {
        const { userId, symptoms } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `Act as an AI Medical Analyst. Generate a detailed, professional health report based on these symptoms: "${symptoms}". Include potential causes, recommendations, and whether seeing a doctor is advised. End with a disclaimer that this is AI generated.`;
        const result = await model.generateContent(prompt);
        const aiAnalysis = result.response.text();

        const newReport = new Report({
            user_id: userId, symptoms, ai_analysis: aiAnalysis
        });
        await newReport.save();

        res.json({ message: 'Report generated successfully', report: newReport });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/:userId', async (req, res) => {
    try {
        const reports = await Report.find({ user_id: req.params.userId }).sort({ created_at: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Medications
app.get('/api/medications/:userId', async (req, res) => {
    try {
        const medications = await Medication.find({ user_id: req.params.userId });
        res.json(medications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/medications', async (req, res) => {
    try {
        const { userId, email, phone, name, dosage, frequency, time } = req.body;
        const newMedication = new Medication({ user_id: userId, name, dosage, frequency, time });
        await newMedication.save();

        if (email) {
            mailer.sendNotification(email, "Medication Schedule Configured: Arogya AI Healthcare", `Medicine: ${name} (${dosage})\nFrequency: ${frequency}\nTime: ${time}`);
        }
        if (phone) {
            sms.sendSMS(phone, `Arogya Notification: Medication ${name} at ${time} scheduled successfully.`);
        }
        res.json({ message: 'Medication added', medicationId: newMedication._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/medications/:id', async (req, res) => {
    try {
        const med = await Medication.findById(req.params.id).populate('user_id');
        if (med) {
            await Medication.findByIdAndDelete(req.params.id);
            if (med.user_id && med.user_id.email) {
                mailer.sendNotification(med.user_id.email, "Medication Removed: Arogya AI Healthcare", `Your medication schedule for ${med.name} (${med.dosage}) has been successfully deleted.`);
            }
            if (med.user_id && med.user_id.phone) {
                sms.sendSMS(med.user_id.phone, `Arogya Notification: Medication ${med.name} has been removed from your schedule.`);
            }
        } else {
            return res.status(404).json({ error: 'Medication not found' });
        }
        res.json({ message: 'Medication removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mental Wellness Engine API (FR-12)
app.post('/api/wellness-checkin', async (req, res) => {
    try {
        const { userId, mood, stressLevel, energyLevel, sleepQuality, journalEntry } = req.body;
        const riskScore = (stressLevel * 2) - energyLevel + (mood === 'Sad' || mood === 'Anxious' ? 10 : 0);
        
        let aiFeedback = "Thank you for checking in today.";
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
            const prompt = `You are a highly empathetic, friendly, and comforting virtual psychologist. Your patient has submitted a daily wellness check-in:
Mood: ${mood}
Stress Level: ${stressLevel}/10
Energy Level: ${energyLevel}/10
Sleep Quality: ${sleepQuality}
Journal Entry: "${journalEntry || 'No journal entry provided.'}"

Please analyze their state and provide a short, compassionate response (around 3-4 sentences). Act as their virtual doctor. Provide gentle, actionable remedies tailored to their current state and journal entry (if provided). If they indicate feelings of depression, anxiety, or high stress, be extremely supportive, validate their feelings, and suggest soothing coping mechanisms. Write your response directly to the patient in a warm, comforting tone.`;
            
            const result = await model.generateContent(prompt);
            aiFeedback = result.response.text();
        } catch (aiErr) {
            console.error("AI Feedback Error:", aiErr);
            aiFeedback = "Your check-in has been recorded. Remember to take deep breaths and be kind to yourself today.";
        }
        
        const record = new WellnessRecord({
            user_id: userId, mood, stressLevel, energyLevel, sleepQuality, journalEntry, riskScore, aiFeedback
        });
        await record.save();

        res.json({ message: 'Mental wellness check-in saved', record });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/wellness-checkin/:userId', async (req, res) => {
    try {
        const records = await WellnessRecord.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/wellness', (req, res) => {
    const tips = [
        { id: 1, category: 'Nutrition', title: 'Eat the Rainbow', description: 'Include a variety of colorful fruits and vegetables in your diet.', icon: '🥗' },
        { id: 2, category: 'Sleep', title: 'Maintain a Schedule', description: 'Go to bed and wake up at the same time to regulate your circadian rhythm.', icon: '😴' },
        { id: 3, category: 'Exercise', title: 'Stay Active', description: 'Aim for at least 30 minutes of activity every day.', icon: '🏃' },
        { id: 4, category: 'Hydration', title: 'Drink Water', description: 'Drink at least 8 glasses of water a day.', icon: '💧' },
        { id: 5, category: 'Mental Health', title: 'Practice Mindfulness', description: 'Take 5 minutes for deep breathing to reduce stress.', icon: '🧘' }
    ];
    res.json(tips);
});

app.listen(PORT, () => {
    console.log(`Healthcare Backend listening on port ${PORT}`);
});
