const EmployeeRepository = require('../repositories/employeeRepository');

exports.getAll = async (req, res) => {
  const data = await EmployeeRepository.findAll();
  res.json(data);
};

exports.create = async (req, res) => {
  const data = await EmployeeRepository.create(req.body);
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const data = await EmployeeRepository.update(req.params.id, req.body);
  data ? res.json(data) : res.status(404).json({ message: "Employee not found" });
};

exports.delete = async (req, res) => {
  const success = await EmployeeRepository.delete(req.params.id);
  success ? res.json({ message: "Employee deleted" }) : res.status(404).json({ message: "Employee not found" });
};