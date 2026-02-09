class TelegramLog {
    constructor(id, telegram_id, username, message_type, message_content, created_at) {
        this.id = id;
        this.telegram_id = telegram_id;
        this.username = username;
        this.message_type = message_type;
        this.message_content = message_content;
        this.created_at = created_at;
    }
}

module.exports = TelegramLog;
