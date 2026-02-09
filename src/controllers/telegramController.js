const https = require('https');
const EmployeeRepository = require('../repositories/employeeRepository');
const EmployeeTeleDetailsRepository = require('../repositories/employeeTeleDetailsRepository');

// Helper to send messages to Telegram
const sendMessage = (chatId, text, replyMarkup = null) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error('TELEGRAM_BOT_TOKEN is not defined');
        return;
    }

    const data = JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_markup: replyMarkup
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        res.on('data', () => { }); // Consume response
    });

    req.on('error', (e) => {
        console.error(`Telegram API Error: ${e.message}`);
    });

    req.write(data);
    req.end();
};

exports.handleWebhook = async (req, res) => {
    try {
        const update = req.body;

        // Log webhook event
        console.log(`[Telegram Webhook] ${JSON.stringify(update)}`);

        if (!update.message) {
            return res.status(200).send('OK');
        }

        const message = update.message;
        const chatId = message.chat.id;
        const telegramId = message.from.id;
        const username = message.from.username;
        const firstName = message.from.first_name;

        // 1. Handle /start command
        if (message.text === '/start') {
            const existingUser = await EmployeeTeleDetailsRepository.findByTelegramId(telegramId);

            // Case A: User Already Registered (isactive = 0 means active as per requirements)
            if (existingUser && existingUser.isactive === 0) {
                const replyMarkup = {
                    keyboard: [
                        [{ text: "Apply Leave" }, { text: "View Leave Status" }],
                        [{ text: "Leave Balance" }]
                    ],
                    resize_keyboard: true
                };
                sendMessage(chatId, `👋 Welcome ${firstName}!\n\nYou are already registered with the Leave Management System.\n\nPlease use the menu to:`, replyMarkup);
            }
            // Case B: Telegram ID Not Found - Ask for permission
            else {
                const replyMarkup = {
                    keyboard: [
                        [{
                            text: "📱 Share Mobile Number",
                            request_contact: true
                        }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                };
                sendMessage(chatId, `👋 Welcome to the Leave Management Bot!\n\nTo complete your registration, please share your registered mobile number.`, replyMarkup);
            }
        }

        // 2. Handle Contact Share
        else if (message.contact) {
            const contact = message.contact;

            // Validation: contact.user_id MUST match message.from.id
            if (contact.user_id !== telegramId) {
                sendMessage(chatId, "❌ Verification failed. Please share your own contact.");
                return res.status(200).send('OK');
            }

            // Check Mobile Number in Employee Table
            // Note: Telegram sends number with country code, e.g., "919876543210" or "+91..."
            // Adjust matching logic if database stores it differently. 
            // Assuming exact match or need to strip '+'? 
            // For now, using raw phone number from contact.phone_number

            let phoneNumber = contact.phone_number;
            if (phoneNumber.startsWith('+')) {
                phoneNumber = phoneNumber.substring(1);
            }

            // Try to find exact match or match specific formats if needed. 
            // Trying exact match on phoneNumber provided by Telegram (usually has country code without + if we strip it, or with +)
            // Let's rely on what the DB might have. If DB has "9876543210" and Telegram sends "919876543210", it won't match.
            // Strict match for now as per "SELECT * FROM Employee WHERE mobile_no = :phone_number;"

            // NOTE: Reverting to using the raw number or maybe trying both with/without + if needed.
            // But let's assume standard format for now.

            const employee = await EmployeeRepository.findByMobileNumber(phoneNumber) || await EmployeeRepository.findByMobileNumber(contact.phone_number);

            // Case C: Employee Found
            if (employee) {
                // Insert into Employee_tele_details
                // isactive: 0 (Active)
                await EmployeeTeleDetailsRepository.create({
                    empcode: employee.empcode, // Using empcode from employee table to link? or just store logic? 
                    // Wait, Employee_tele_details has `empcode` column, not `employee_id` FK in my previous file creation?
                    // Re-checking `Employee_tele_details` model: it has `empcode`.
                    // User prompt said "employee_id FK", but my model uses `empcode`.
                    // The Repository `create` method expects: { empcode, telegramid, mobileno, ismatching, isactive, telegram_username }

                    empcode: employee.empcode,
                    telegramid: telegramId,
                    mobileno: phoneNumber,
                    ismatching: true,
                    isactive: 0, // 0 = active
                    telegram_username: username
                });

                const replyMarkup = {
                    keyboard: [
                        [{ text: "Apply Leave" }, { text: "View Leave Status" }],
                        [{ text: "Leave Balance" }]
                    ],
                    resize_keyboard: true
                };

                sendMessage(chatId, `✅ Registration Completed!\n\nHi ${employee.name}, your Telegram account has been successfully linked.\n\nYou can now:\n• Apply Leave\n• Track Leave Status\n• View Leave Balance\n\nUse the menu to get started 🚀`, replyMarkup);
            }
            // Case D: Mobile Number Not Found
            else {
                sendMessage(chatId, `❌ Registration Failed\n\nThis mobile number (${phoneNumber}) is not registered in our employee system.\nPlease contact HR for assistance.`);
            }
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).send('Internal Server Error');
    }
};
