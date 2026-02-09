const EmployeeTeleDetailsRepository = require('../repositories/employeeTeleDetailsRepository');

exports.getAll = async (req, res) => {
    try {
        const data = await EmployeeTeleDetailsRepository.findAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await EmployeeTeleDetailsRepository.findById(req.params.id);
        if (!data) return res.status(404).json({ message: "Record not found" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await EmployeeTeleDetailsRepository.create(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const data = await EmployeeTeleDetailsRepository.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: "Record not found" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const success = await EmployeeTeleDetailsRepository.delete(req.params.id);
        if (!success) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Record deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
