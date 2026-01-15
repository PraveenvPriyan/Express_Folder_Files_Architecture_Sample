// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Direct DB call or create an AuthRepository

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM employees WHERE email = $1', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: "Login successful",
            token: token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};