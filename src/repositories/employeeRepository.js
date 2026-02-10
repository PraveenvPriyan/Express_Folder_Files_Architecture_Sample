const db = require('../config/db');
const Employee = require('../models/employeeModel');

const EmployeeRepository = {
  async findByEmail(email) {
    const { rows } = await db.query('SELECT id, name, email, empcode, mobilenumber, isactive FROM public."Employee" WHERE TRIM(email) = $1', [email]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return new Employee(r.id, r.name?.trim(), r.email?.trim(), r.mobilenumber?.trim(), r.empcode?.trim(), r.isactive);
  },

  async findAll() {
    const { rows } = await db.query('SELECT id, name, email, empcode, mobilenumber, isactive FROM public."Employee" ORDER BY id ASC');
    return rows.map(r => new Employee(r.id, r.name?.trim(), r.email?.trim(), r.mobilenumber?.trim(), r.empcode?.trim(), r.isactive));
  },

  async create(data) {
    const { name, email, mobilenumber, empcode, isactive } = data;
    const { rows } = await db.query(
      'INSERT INTO public."Employee" (name, email, mobilenumber, empcode, isactive) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, empcode, mobilenumber, isactive',
      [name, email, mobilenumber, empcode, isactive]
    );
    const r = rows[0];
    return new Employee(r.id, r.name?.trim(), r.email?.trim(), r.mobilenumber?.trim(), r.empcode?.trim(), r.isactive);
  },

  async update(id, data) {
    const { name, email, mobilenumber, empcode, isactive } = data;
    const { rows } = await db.query(
      'UPDATE public."Employee" SET name=$1, email=$2, mobilenumber=$3, empcode=$4, isactive=$5 WHERE id=$6 RETURNING id, name, email, empcode, mobilenumber, isactive',
      [name, email, mobilenumber, empcode, isactive, id]
    );
    const r = rows[0];
    return r ? new Employee(r.id, r.name?.trim(), r.email?.trim(), r.mobilenumber?.trim(), r.empcode?.trim(), r.isactive) : null;
  },

  async delete(id) {
    const result = await db.query('DELETE FROM public."Employee" WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  async findByMobileNumber(mobileNumber) {
    console.log(`[EmployeeRepository] findByMobileNumber searching for: '${mobileNumber}'`);
    // Use REGEXP_REPLACE to remove ALL whitespace (spaces, tabs, newlines) from the DB column before comparison
    const { rows } = await db.query('SELECT id, name, email, empcode, mobilenumber, isactive FROM public."Employee" WHERE REGEXP_REPLACE(mobilenumber, \'\\s+\', \'\', \'g\') = $1', [mobileNumber]);

    if (rows.length === 0) {
      console.log(`[EmployeeRepository] No employee found for mobile: ${mobileNumber}`);
      return null;
    }

    const r = rows[0];
    console.log(`[EmployeeRepository] Found: ${r.mobilenumber}`);
    return new Employee(r.id, r.name?.trim(), r.email?.trim(), r.mobilenumber?.trim(), r.empcode?.trim(), r.isactive);
  }
};

module.exports = EmployeeRepository;