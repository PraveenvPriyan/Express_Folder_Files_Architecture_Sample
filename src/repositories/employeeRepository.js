const db = require('../config/db');
const Employee = require('../models/employeeModel');

const EmployeeRepository = {
  async findByEmail(email) {
    const { rows } = await db.query('SELECT id, name, email, empcode, mobilenumber, isactive FROM public."Employee" WHERE email = $1', [email]);
    const r = rows[0];
    return r ? new Employee(r.id, r.name, r.email, r.mobilenumber, r.empcode, r.isactive) : null;
  },

  async findAll() {
    const { rows } = await db.query('SELECT id, name, email, empcode, mobilenumber, isactive FROM public."Employee" ORDER BY id ASC');
    return rows.map(r => new Employee(r.id, r.name, r.email, r.mobilenumber, r.empcode, r.isactive));
  },

  async create(data) {
    const { name, email, mobilenumber, empcode, isactive } = data;
    const { rows } = await db.query(
      'INSERT INTO public."Employee" (name, email, mobilenumber, empcode, isactive) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, empcode, mobilenumber, isactive',
      [name, email, mobilenumber, empcode, isactive]
    );
    const r = rows[0];
    return new Employee(r.id, r.name, r.email, r.mobilenumber, r.empcode, r.isactive);
  },

  async update(id, data) {
    const { name, email, mobilenumber, empcode, isactive } = data;
    const { rows } = await db.query(
      'UPDATE public."Employee" SET name=$1, email=$2, mobilenumber=$3, empcode=$4, isactive=$5 WHERE id=$6 RETURNING id, name, email, empcode, mobilenumber, isactive',
      [name, email, mobilenumber, empcode, isactive, id]
    );
    const r = rows[0];
    return r ? new Employee(r.id, r.name, r.email, r.mobilenumber, r.empcode, r.isactive) : null;
  },

  async delete(id) {
    const result = await db.query('DELETE FROM public."Employee" WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  async findByMobileNumber(mobileNumber) {
    const { rows } = await db.query('SELECT id, name, email, empcode, mobilenumber, isactive FROM public."Employee" WHERE mobilenumber = $1', [mobileNumber]);
    const r = rows[0];
    return r ? new Employee(r.id, r.name, r.email, r.mobilenumber, r.empcode, r.isactive) : null;
  }
};

module.exports = EmployeeRepository;