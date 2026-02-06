// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Direct DB call or create an AuthRepository

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    console.log('Attempting login for email:', email);

    const { rows } = await db.query(
      'SELECT id, email, password FROM employees WHERE email = $1',
      [email]
    );


    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    console.log('User found:', password.trim(),user.password.trim());
//    const isMatch = await bcrypt.compare(password.trim(),user.password.trim());

//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

        if (password.trim() !== user.password.trim()) {
        return res.status(401).json({ message: "Invalid email or password" });
        }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};