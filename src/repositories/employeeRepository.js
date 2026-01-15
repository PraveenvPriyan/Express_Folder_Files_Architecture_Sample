const db = require('../config/db');
const Employee = require('../models/employeeModel');

const EmployeeRepository = {
  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM employees WHERE email = $1', [email]);
    const r = rows[0];
    return r ? new Employee(r.id, r.name, r.email, r.password, r.designation) : null;
  },

  async findAll() {
    const { rows } = await db.query('SELECT id, name, email, designation FROM employees ORDER BY id ASC');
    return rows.map(r => new Employee(r.id, r.name, r.email, null, r.designation));
  },

  async create(data) {
    const { name, email, password, designation } = data;
    const { rows } = await db.query(
      'INSERT INTO employees (name, email, password, designation) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, password, designation]
    );
    const r = rows[0];
    return new Employee(r.id, r.name, r.email, null, r.designation);
  },

  async update(id, data) {
    const { name, email, designation } = data;
    const { rows } = await db.query(
      'UPDATE employees SET name=$1, email=$2, designation=$3 WHERE id=$4 RETURNING *',
      [name, email, designation, id]
    );
    const r = rows[0];
    return r ? new Employee(r.id, r.name, r.email, null, r.designation) : null;
  },

  async delete(id) {
    const result = await db.query('DELETE FROM employees WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

module.exports = EmployeeRepository;