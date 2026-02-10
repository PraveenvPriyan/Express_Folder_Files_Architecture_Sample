const https = require('https');
const EmployeeRepository = require('../repositories/employeeRepository');
const EmployeeTeleDetailsRepository = require('../repositories/employeeTeleDetailsRepository');
const TelegramLogRepository = require('../repositories/telegramLogRepository');

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
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            console.log(`[Telegram API] Status: ${res.statusCode}`);
            if (res.statusCode >= 400) {
                console.error(`[Telegram API] Error Body: ${responseBody}`);
            }
        });
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

        // --- NEW: Log Message to DB ---
        let messageType = 'unknown';
        let messageContent = '';

        if (message.text) {
            messageType = 'text';
            messageContent = message.text;
        } else if (message.contact) {
            messageType = 'contact';
            messageContent = JSON.stringify(message.contact);
        }

        try {
            await TelegramLogRepository.create({
                telegram_id: telegramId,
                username: username || '',
                message_type: messageType,
                message_content: messageContent
            });
            console.log(`[Telegram Webhook] Logged message from ${telegramId}`);
        } catch (logErr) {
            console.error(`[Telegram Webhook] Failed to log message: ${logErr.message}`);
            // Do not fail the request if logging fails
        }
        // ------------------------------

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
                        [
                            {
                                text: "📱 Share Mobile Number",
                                request_contact: true
                            }
                        ]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: false
                };

                sendMessage(
                    chatId,
                    `👋 Welcome to the Leave Management Bot!\n\nTo complete your registration, please share your registered mobile number.`,
                    replyMarkup
                );

                return res.status(200).send('OK'); // 🔴 IMPORTANT

            }
        }

        // 2. Handle Contact Share
        else if (message.contact) {
            const contact = message.contact;
            console.log(`[Telegram Webhook] Received Contact: ${JSON.stringify(contact)}`);

            // Validation: contact.user_id MUST match message.from.id
            if (contact.user_id !== telegramId) {
                console.log(`[Telegram Webhook] Contact user_id mismatch: ${contact.user_id} !== ${telegramId}`);
                sendMessage(chatId, "❌ Verification failed. Please share your own contact.");
                return res.status(200).send('OK');
            }

            // Check Mobile Number in Employee Table
            // Check Mobile Number in Employee Table
            let rawPhoneNumber = contact.phone_number.trim();
            // Remove spaces, dashes, parentheses, and plus sign
            let phoneNumber = rawPhoneNumber.replace(/[^0-9]/g, '');

            console.log(`[Telegram Webhook] Raw Phone: ${rawPhoneNumber}, Cleaned: ${phoneNumber}`);

            // Try multiple formats:
            // 1. Exact match with cleaned number (e.g., 919876543210)
            // 2. Without country code (last 10 digits) (e.g., 9876543210)

            let last10 = phoneNumber.length >= 10 ? phoneNumber.trim().slice(-10) : phoneNumber.trim();

            console.log(`[Telegram Webhook] Searching for: ${phoneNumber} or ${last10}`);

            // Custom query logic might be needed if Repository only takes one arg, 
            // but we can query by last 10 digits if we trust the DB to be unique on that.
            // Or try finding by both.

            try {
                await TelegramLogRepository.create({
                    telegram_id: telegramId,
                    username: username || '',
                    message_type: "contact_verification_attempt",
                    message_content: `Input: ${phoneNumber}, Last10: ${last10}`
                });
            } catch (logErr) {
                console.error(`[Telegram Webhook] Failed to log attempt: ${logErr.message}`);
            }

            let employee = await EmployeeRepository.findByMobileNumber(phoneNumber.trim());

            if (!employee && last10 !== phoneNumber) {
                console.log(`[Telegram Webhook] Exact match failed, trying last 10 digits: ${last10}`);
                employee = await EmployeeRepository.findByMobileNumber(last10.trim());
            }

            const status = employee ? 'Found' : 'Not Found';
            console.log(`[Telegram Webhook] Employee Lookup Result: ${status}`);

            // Log Outcome
            try {
                await TelegramLogRepository.create({
                    telegram_id: telegramId,
                    username: username || '',
                    message_type: "contact_verification_result",
                    message_content: `Status: ${status}, Employee: ${employee ? employee.empcode : 'N/A'}`
                });
            } catch (logErr) { console.error(logErr); }

            // Case D: Mobile Number Not Found
            if (!employee) {
                sendMessage(chatId, `❌ Registration Failed\n\nThis mobile number (${phoneNumber}) is not registered in our employee system.\nPlease contact HR for assistance.`);
                return res.status(200).send('OK');
            } else {
                // Case C: Employee Found
                // Insert into Employee_tele_details
                // isactive: 0 (Active)
                await EmployeeTeleDetailsRepository.create({
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
                return res.status(200).send('OK');
            }


        }

        res.status(200).send('OK');
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).send('Internal Server Error');
    }
};
