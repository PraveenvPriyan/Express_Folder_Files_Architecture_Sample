require('dotenv').config();
const express = require('express');
const requestFilter = require('./middleware/requestFilter');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const employeeTeleDetailsRoutes = require('./routes/employeeTeleDetailsRoutes');
const telegramRoutes = require('./routes/telegramRoutes');

const app = express();
app.use(express.json());
app.use(requestFilter); // Apply request/response filters globally

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee-tele-details', employeeTeleDetailsRoutes);
app.use('/api/telegram', telegramRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.TELEGRAM_BOT_TOKEN) {
        console.log('TELEGRAM_BOT_TOKEN is loaded.');
    } else {
        console.error('WARNING: TELEGRAM_BOT_TOKEN is NOT defined in .env');
    }
});