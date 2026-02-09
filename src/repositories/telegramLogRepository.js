const db = require('../config/db');
const TelegramLog = require('../models/telegramLogModel');

const TelegramLogRepository = {
    async create(data) {
        const { telegram_id, username, message_type, message_content } = data;
        const { rows } = await db.query(
            'INSERT INTO telegram_logs (telegram_id, username, message_type, message_content, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [telegram_id, username, message_type, message_content]
        );
        const r = rows[0];
        return new TelegramLog(r.id, r.telegram_id, r.username, r.message_type, r.message_content, r.created_at);
    },

    async findAll() {
        const { rows } = await db.query('SELECT * FROM telegram_logs ORDER BY created_at DESC');
        return rows.map(r => new TelegramLog(r.id, r.telegram_id, r.username, r.message_type, r.message_content, r.created_at));
    }
};

module.exports = TelegramLogRepository;
