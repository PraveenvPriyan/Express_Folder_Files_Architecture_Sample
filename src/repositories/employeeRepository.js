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
      [name?.trim(), email?.trim(), mobilenumber?.trim(), empcode?.trim(), isactive]
    );
    const r = rows[0];
    return new Employee(r.id, r.name?.trim(), r.email?.trim(), r.mobilenumber?.trim(), r.empcode?.trim(), r.isactive);
  },

  async update(id, data) {
    const { name, email, mobilenumber, empcode, isactive } = data;
    const { rows } = await db.query(
      'UPDATE public."Employee" SET name=$1, email=$2, mobilenumber=$3, empcode=$4, isactive=$5 WHERE id=$6 RETURNING id, name, email, empcode, mobilenumber, isactive',
      [name?.trim(), email?.trim(), mobilenumber?.trim(), empcode?.trim(), isactive, id]
    );
    const r = rows[0];
    return r ? new Employee(r.id, r.name?.trim(), r.email?.trim(), r.mobilenumber?.trim(), r.empcode?.trim(), r.isactive) : null;
  },

  async delete(id) {
    const result = await db.query('DELETE FROM public."Employee" WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  async findByMobileNumber(mobileNumber) {
    // 1️⃣ Normalize input (outside variable – VERY IMPORTANT)
    const cleanMobile = mobileNumber
      .toString()
      .trim()
      .replace(/\s+/g, '')   // remove all spaces
      .replace(/^\+91/, '')  // remove +91
      .replace(/^91/, '')    // remove 91
      .slice(-10);           // keep last 10 digits only

    console.log(`[EmployeeRepository] searching for normalized mobile: '${cleanMobile}'`);

    // 2️⃣ Normalize DB value + compare LAST 10 digits
    const query = `
    SELECT id, name, email, empcode, mobilenumber, isactive
    FROM public."Employee"
    WHERE RIGHT(
      REGEXP_REPLACE(mobilenumber::text, '\\s+', '', 'g'),
      10
    ) = $1
  `;

    const { rows } = await db.query(query, [cleanMobile]);

    // 3️⃣ No result
    if (rows.length === 0) {
      console.log(`[EmployeeRepository] No employee found for mobile: ${cleanMobile}`);
      return null;
    }

    // 4️⃣ Success
    const r = rows[0];
    console.log(`[EmployeeRepository] Found employee with DB mobile: '${r.mobilenumber}'`);

    return new Employee(
      r.id,
      r.name?.trim(),
      r.email?.trim(),
      r.mobilenumber?.toString().trim(),
      r.empcode?.trim(),
      r.isactive
    );
  }


};

module.exports = EmployeeRepository;