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
const Admin = require('./models/Admin');
const Report = require('./models/Report');
const Medication = require('./models/Medication');
const WellnessRecord = require('./models/WellnessRecord');
const Prescription = require('./models/Prescription');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB().then(async () => {
    // Seed Admin
    const adminExists = await Admin.findOne({ username: 'vicky' });
    if (!adminExists) {
        const newAdmin = new Admin({ username: 'vicky', password: '1234' });
        await newAdmin.save();
        console.log("Admin seeded: vicky/1234");
    }

    // Update existing doctors with missing emails
    await Doctor.updateMany({ email: { $exists: false } }, { email: 'doctor@arogya.test' });
    // Update existing doctors with missing availability
    await Doctor.updateMany({ availability: { $exists: false } }, { availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] });
});

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize continuous background processing logic
cronWorkers.startCronJobs();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

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

// Admin API
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username, password });
        if (!admin) return res.status(401).json({ error: 'Invalid admin credentials' });
        res.json({ message: 'Admin login successful', admin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/doctors', async (req, res) => {
    try {
        const newDoctor = new Doctor(req.body);
        await newDoctor.save();
        res.json({ message: 'Doctor added successfully', doctor: newDoctor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/doctors/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Doctor updated successfully', doctor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/doctors/:id', async (req, res) => {
    try {
        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ message: 'Doctor removed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Appointments API
app.get('/api/admin/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('user_id').populate('doctor_id');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/appointments/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ message: 'Appointment status updated', appointment });
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
                { name: 'Dr. R. K. Sharma', specialization: genericSpec, location: displayLoc, phone: '+91-9876543210', address: `Central Clinic, ${displayLoc}`, rating: 4.8, image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80', email: 'drsharma@example.com', availability: ['Monday', 'Wednesday', 'Friday'] },
                { name: 'Dr. Anita Desai', specialization: 'Cardiologist', location: displayLoc, phone: '+91-9876543211', address: `City Heart Center, ${displayLoc}`, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1594824436998-d50d6ff71c6d?w=300&q=80', email: 'drdesai@example.com', availability: ['Tuesday', 'Thursday', 'Saturday'] },
                { name: 'Dr. Vikram Singh', specialization: 'Neurologist', location: displayLoc, phone: '+91-9876543212', address: `Brain & Spine Institute, ${displayLoc}`, rating: 4.7, image_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&q=80', email: 'drvikram@example.com', availability: ['Monday', 'Tuesday', 'Wednesday'] },
                { name: 'Dr. Meera Patel', specialization: 'Dermatologist', location: displayLoc, phone: '+91-9876543213', address: `Skin Glow Care, ${displayLoc}`, rating: 4.6, image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80', email: 'drmeera@example.com', availability: ['Wednesday', 'Thursday', 'Friday'] },
                { name: 'Dr. Rahul Verma', specialization: 'Pediatrician', location: displayLoc, phone: '+91-9876543214', address: `Kids Health Clinic, ${displayLoc}`, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1612349317150-e410f624c427?w=300&q=80', email: 'drverma@example.com', availability: ['Monday', 'Tuesday', 'Friday'] }
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
        
        if (!userId || !doctorId) {
            return res.status(400).json({ error: 'Missing userId or doctorId' });
        }

        // Find doctor to get their email and update unavailable dates
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

        const newAppointment = new Appointment({
            user_id: userId, doctor_id: doctorId, date, time
        });
        await newAppointment.save();

        // Mark date as unavailable (simulating a filled slot)
        if (!doctor.unavailableDates) doctor.unavailableDates = [];
        if (!doctor.unavailableDates.includes(date)) {
            doctor.unavailableDates.push(date);
            await doctor.save();
        }

        // Send Email to User
        if (email) {
            mailer.sendNotification(email, "Appointment Confirmed: Arogya AI Healthcare", `Your doctor appointment with ${doctorName || 'a specialist'} has been scheduled for ${date} at ${time}.`);
        }
        
        // Send Email to Doctor
        if (doctor.email) {
            mailer.sendNotification(doctor.email, "New Appointment Booking: Arogya AI Healthcare", `Hello Dr. ${doctor.name}, you have a new appointment booking.\n\nPatient: ${req.body.patientName || 'A User'}\nDate: ${date}\nTime: ${time}\nPatient Phone: ${phone || 'N/A'}`);
        }

        if (phone) {
            sms.sendSMS(phone, `Arogya Notification: Your doctor appointment with ${doctorName} is confirmed for ${date} at ${time}.`);
        }

        res.json({ message: 'Appointment booked successfully', appointmentId: newAppointment._id });
    } catch (err) {
        console.error("Booking API Error:", err);
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
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-lite-latest",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `Act as an AI Medical Assistant. Based on these symptoms: "${symptoms}", analyze the condition.
You MUST return ONLY a valid JSON object matching this exact schema, with no markdown code blocks:
{
  "normal_symptoms": "Describe what is typically normal for this condition.",
  "high_risks": "List any red flags, severe warnings, or high-risk indicators to watch out for.",
  "home_remedies": "Suggest safe and gentle home remedies.",
  "other_advice": "Provide any other general advice and state whether a doctor visit is recommended."
}`;
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

// Prescription Analysis API
app.post('/api/prescriptions', async (req, res) => {
    try {
        const { userId, imageData } = req.body;
        // imageData is expected to be a Base64 string e.g. "data:image/jpeg;base64,..."
        
        // Extract base64 and mime type
        const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ error: 'Invalid image format. Expected base64 data URI.' });
        }
        
        const mimeType = matches[1];
        const base64Data = matches[2];

        // Use gemini-flash-lite-latest for multimodal analysis
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `You are an expert pharmacist and AI medical assistant. Please carefully analyze this uploaded prescription image.
Provide a very clear, user-friendly, and simple description of what medications are prescribed, their dosages, and the instructions for taking them.
If there are any warnings or common side effects to be aware of for these medications, please list them briefly.
Do NOT use markdown symbols like **, ##, or __. Use plain text with simple dashes for lists.
Do NOT give definitive medical advice, and end with a short disclaimer that this is AI-generated and the user should confirm with their doctor.`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }]
        });
        const aiDescription = result.response.text();

        const newPrescription = new Prescription({
            user_id: userId,
            image_data: imageData,
            ai_description: aiDescription
        });
        await newPrescription.save();

        res.json({ message: 'Prescription analyzed successfully', prescription: newPrescription });
    } catch (err) {
        console.error("Prescription Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/prescriptions/:userId', async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ user_id: req.params.userId }).sort({ created_at: -1 });
        res.json(prescriptions);
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
    const allTips = [
        { id: 1,  category: 'Nutrition',      title: 'Eat the Rainbow',          description: 'Include a variety of colorful fruits and vegetables in your diet for broad nutrient coverage.', icon: '🥗' },
        { id: 2,  category: 'Sleep',          title: 'Maintain a Schedule',      description: 'Go to bed and wake up at the same time every day to regulate your circadian rhythm.', icon: '😴' },
        { id: 3,  category: 'Exercise',       title: 'Stay Active',              description: 'Aim for at least 30 minutes of moderate physical activity every day to boost overall health.', icon: '🏃' },
        { id: 4,  category: 'Hydration',      title: 'Drink More Water',         description: 'Drink at least 8 glasses of water a day. Proper hydration boosts energy and brain function.', icon: '💧' },
        { id: 5,  category: 'Mental Health',  title: 'Practice Mindfulness',     description: 'Take 5 minutes for deep breathing or meditation to significantly reduce daily stress.', icon: '🧘' },
        { id: 6,  category: 'Nutrition',      title: 'Reduce Sugar Intake',      description: 'Cutting down on added sugar lowers your risk of diabetes, obesity, and heart disease.', icon: '🍬' },
        { id: 7,  category: 'Sleep',          title: 'Avoid Screens at Night',   description: 'Blue light from devices disrupts melatonin. Switch off screens 1 hour before bed.', icon: '📵' },
        { id: 8,  category: 'Exercise',       title: 'Take the Stairs',          description: 'Small choices like taking stairs over elevators accumulate into significant fitness gains over time.', icon: '🪜' },
        { id: 9,  category: 'Hydration',      title: 'Start Your Day with Water',description: 'Drink a glass of water first thing in the morning to rehydrate your body after sleep.', icon: '🌅' },
        { id: 10, category: 'Mental Health',  title: 'Journal Your Thoughts',    description: 'Writing down your feelings for 10 minutes a day can reduce anxiety and improve mood clarity.', icon: '📓' },
        { id: 11, category: 'Nutrition',      title: 'Eat Mindfully',            description: 'Slow down and savor each bite. Mindful eating improves digestion and prevents overeating.', icon: '🍽️' },
        { id: 12, category: 'Sleep',          title: 'Create a Sleep Ritual',    description: 'A relaxing pre-sleep ritual like reading or herbal tea trains your brain to wind down naturally.', icon: '🛁' },
        { id: 13, category: 'Exercise',       title: 'Stretch Every Morning',    description: 'A 5-minute morning stretch routine improves flexibility, blood flow, and reduces injury risk.', icon: '🤸' },
        { id: 14, category: 'Hydration',      title: 'Eat Water-Rich Foods',     description: 'Cucumbers, watermelon, and oranges are over 90% water — great for hydration from food.', icon: '🍉' },
        { id: 15, category: 'Mental Health',  title: 'Connect with Others',      description: 'Strong social connections are linked to a longer, healthier, and happier life. Reach out today.', icon: '🤝' },
        { id: 16, category: 'Nutrition',      title: 'Add More Fiber',           description: 'High-fiber foods like legumes, oats, and greens support a healthy gut and lower cholesterol.', icon: '🌾' },
        { id: 17, category: 'Sleep',          title: 'Keep Your Room Cool',      description: 'The ideal sleep temperature is around 18°C (65°F). A cool room promotes deeper sleep.', icon: '❄️' },
        { id: 18, category: 'Exercise',       title: 'Walk After Meals',         description: 'A 10-minute walk after eating aids digestion and helps regulate blood sugar levels.', icon: '🚶' },
        { id: 19, category: 'Hydration',      title: 'Limit Caffeine',           description: 'Excessive caffeine acts as a diuretic and can lead to dehydration. Limit to 2-3 cups per day.', icon: '☕' },
        { id: 20, category: 'Mental Health',  title: 'Spend Time in Nature',     description: 'Even 20 minutes outdoors in green space measurably reduces cortisol (stress hormone) levels.', icon: '🌿' },
        { id: 21, category: 'Nutrition',      title: 'Prioritize Protein',       description: 'Protein keeps you full longer, preserves muscle mass, and supports immune function.', icon: '🥩' },
        { id: 22, category: 'Sleep',          title: 'Limit Naps',               description: 'If you nap, keep it under 20 minutes and before 3pm to avoid disrupting nighttime sleep.', icon: '⏰' },
        { id: 23, category: 'Exercise',       title: 'Try Yoga',                 description: 'Yoga combines physical movement with breathing and mindfulness — triple health benefits in one.', icon: '🧘' },
        { id: 24, category: 'Hydration',      title: 'Flavor Your Water',        description: 'Add slices of lemon, cucumber, or mint to make drinking water more enjoyable.', icon: '🍋' },
        { id: 25, category: 'Mental Health',  title: 'Practice Gratitude',       description: 'Write down 3 things you are grateful for each day. It rewires the brain toward positivity.', icon: '🙏' },
        { id: 26, category: 'Nutrition',      title: 'Healthy Snacking',         description: 'Replace processed snacks with nuts, seeds, or fruits to sustain energy and focus throughout the day.', icon: '🥜' },
        { id: 27, category: 'Sleep',          title: 'Avoid Alcohol Before Bed', description: 'Alcohol disrupts REM sleep cycles, leaving you feeling less rested even after a full night.', icon: '🚫' },
        { id: 28, category: 'Exercise',       title: 'Strength Train Weekly',    description: 'Resistance training 2-3 times per week boosts metabolism and protects bone density as you age.', icon: '💪' },
        { id: 29, category: 'Hydration',      title: 'Track Your Intake',        description: 'Use an app or a marked bottle to track your daily water intake and hit your hydration goals.', icon: '📱' },
        { id: 30, category: 'Mental Health',  title: 'Take Digital Breaks',      description: 'Schedule short screen-free breaks during your day to reduce eye strain and mental fatigue.', icon: '🧠' },
    ];

    // Rotate tips every 10 minutes: pick 5 based on current 10-minute window
    const now = new Date();
    const tenMinWindow = Math.floor((now.getHours() * 60 + now.getMinutes()) / 10); // 0-143
    const startIndex = (tenMinWindow * 5) % allTips.length;
    res.json(allTips); // Send all tips; frontend handles rotation
});

app.listen(PORT, () => {
    console.log(`Healthcare Backend listening on port ${PORT}`);
});
