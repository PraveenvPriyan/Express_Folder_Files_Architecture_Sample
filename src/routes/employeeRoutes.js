const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');

// Example: GET is public, others are protected
router.get('/', employeeController.getAll);
router.post('/', authMiddleware, employeeController.create);
router.put('/:id', authMiddleware, employeeController.update);
router.delete('/:id', authMiddleware, employeeController.delete);

module.exports = router;