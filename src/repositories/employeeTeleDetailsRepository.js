const db = require('../config/db');
const Employee_tele_details = require('../models/employee_tele_detailsModel');

const EmployeeTeleDetailsRepository = {
    async findAll() {
        const { rows } = await db.query('SELECT id, empcode, telegramid, mobileno, ismatching, isactive, telegram_username FROM public."Employee_tele_details" ORDER BY id ASC');
        return rows.map(r => new Employee_tele_details(r.id, r.empcode, r.telegramid, r.mobileno, r.ismatching, r.isactive, r.telegram_username));
    },

    async findById(id) {
        const { rows } = await db.query('SELECT id, empcode, telegramid, mobileno, ismatching, isactive, telegram_username FROM public."Employee_tele_details" WHERE id = $1', [id]);
        if (rows.length === 0) return null;
        const r = rows[0];
        return new Employee_tele_details(r.id, r.empcode, r.telegramid, r.mobileno, r.ismatching, r.isactive, r.telegram_username);
    },

    async create(data) {
        const { empcode, telegramid, mobileno, ismatching, isactive, telegram_username } = data;
        const { rows } = await db.query(
            'INSERT INTO public."Employee_tele_details" (empcode, telegramid, mobileno, ismatching, isactive, telegram_username) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, empcode, telegramid, mobileno, ismatching, isactive, telegram_username',
            [empcode, telegramid, mobileno, ismatching, isactive, telegram_username]
        );
        const r = rows[0];
        return new Employee_tele_details(r.id, r.empcode, r.telegramid, r.mobileno, r.ismatching, r.isactive, r.telegram_username);
    },

    async update(id, data) {
        const { empcode, telegramid, mobileno, ismatching, isactive, telegram_username } = data;
        const { rows } = await db.query(
            'UPDATE public."Employee_tele_details" SET empcode=$1, telegramid=$2, mobileno=$3, ismatching=$4, isactive=$5, telegram_username=$6 WHERE id=$7 RETURNING id, empcode, telegramid, mobileno, ismatching, isactive, telegram_username',
            [empcode, telegramid, mobileno, ismatching, isactive, telegram_username, id]
        );
        const r = rows[0];
        return r ? new Employee_tele_details(r.id, r.empcode, r.telegramid, r.mobileno, r.ismatching, r.isactive, r.telegram_username) : null;
    },

    async delete(id) {
        const result = await db.query('DELETE FROM public."Employee_tele_details" WHERE id = $1', [id]);
        return result.rowCount > 0;
    },

    async findByTelegramId(telegramId) {
        const { rows } = await db.query('SELECT id, empcode, telegramid, mobileno, ismatching, isactive, telegram_username FROM public."Employee_tele_details" WHERE telegramid = $1', [telegramId]);
        if (rows.length === 0) return null;
        const r = rows[0];
        return new Employee_tele_details(r.id, r.empcode, r.telegramid, r.mobileno, r.ismatching, r.isactive, r.telegram_username);
    }
};

module.exports = EmployeeTeleDetailsRepository;
