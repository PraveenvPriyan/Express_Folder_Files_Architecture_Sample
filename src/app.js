require('dotenv').config();
const express = require('express');
const cors = require('cors');

const requestFilter = require('./middleware/requestFilter');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const employeeTeleDetailsRoutes = require('./routes/employeeTeleDetailsRoutes');
const telegramRoutes = require('./routes/telegramRoutes');

const app = express();

/* =========================
   ✅ CORS (MUST BE FIRST)
========================= */
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://leavemanagement-lake.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
//app.options('*', cors());

/* =========================
   Middlewares
========================= */
app.use(express.json());
app.use(requestFilter); // keep your filter

/* =========================
   Routes
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee-tele-details', employeeTeleDetailsRoutes);
app.use('/api/telegram', telegramRoutes);

/* =========================
   Server
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.TELEGRAM_BOT_TOKEN) {
        console.log('TELEGRAM_BOT_TOKEN is loaded.');
    } else {
        console.error('WARNING: TELEGRAM_BOT_TOKEN is NOT defined in .env');
    }
});
