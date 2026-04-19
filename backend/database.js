const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'arogya.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database Arogya.');
    }
});

// Create tables and seed data
db.serialize(() => {
    // Users table 
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        gender TEXT,
        age INTEGER,
        weight REAL,
        height REAL,
        bmi REAL,
        bloodGroup TEXT
    )`);

    // Doctors table
    db.run(`CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        specialization TEXT NOT NULL,
        location TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        rating REAL,
        image_url TEXT
    )`);

    // Appointments table
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        doctor_id INTEGER,
        date TEXT,
        time TEXT,
        status TEXT DEFAULT 'Scheduled',
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    )`);

    // Health Reports table
    db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        symptoms TEXT,
        ai_analysis TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Medications table
    db.run(`CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        time TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Seed doctors if empty
    db.get('SELECT COUNT(*) AS count FROM doctors', (err, row) => {
        if (!err && row.count === 0) {
            const stmt = db.prepare('INSERT INTO doctors (name, specialization, location, phone, address, rating, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
            
            const initialDoctors = [
                { name: 'Dr. Jane Smith', specialization: 'Cardiologist', location: 'New York', phone: '555-0101', address: '123 Heart Ave, NY', rating: 4.9, image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80' },
                { name: 'Dr. John Doe', specialization: 'General Physician', location: 'Los Angeles', phone: '555-0102', address: '456 Health St, LA', rating: 4.8, image_url: 'https://images.unsplash.com/photo-1612349317150-e410f624c427?w=300&q=80' },
                { name: 'Dr. Emily Chen', specialization: 'Dermatologist', location: 'New York', phone: '555-0103', address: '789 Skin Blvd, NY', rating: 4.7, image_url: 'https://images.unsplash.com/photo-1594824436998-d50d6ff71c6d?w=300&q=80' },
                { name: 'Dr. Michael Johnson', specialization: 'Neurologist', location: 'Chicago', phone: '555-0104', address: '321 Brain St, CHI', rating: 4.9, image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80' },
                { name: 'Dr. Sarah Williams', specialization: 'Pediatrician', location: 'Los Angeles', phone: '555-0105', address: '555 Kids Rd, LA', rating: 4.9, image_url: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=300&q=80' }
            ];

            initialDoctors.forEach(d => {
                stmt.run([d.name, d.specialization, d.location, d.phone, d.address, d.rating, d.image_url]);
            });
            stmt.finalize();
            console.log('Seeded initial doctors data.');
        }
    });
});

module.exports = db;
