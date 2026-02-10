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

exports.getEmployeeByMobileNumber = async (req, res) => {
  let mobileNumber = req.params.mobilenumber.trim();
  // Clean: remove spaces, dashes, +
  mobileNumber = mobileNumber.replace(/[^0-9]/g, '');

  let data = await EmployeeRepository.findByMobileNumber(mobileNumber);

  if (!data && mobileNumber.length > 10) {
    const last10 = mobileNumber.slice(-10);
    data = await EmployeeRepository.findByMobileNumber(last10);
  }

  // Also try prepending 91 if input is 10 digits but DB has 91? 
  // For now, let's just do the exact match and last-10 match logic as per Bot.
  // But wait, if input is 9249994425 (10 digits) and DB has 919249994425...
  // The 'last 10 digits' logic in the BOT works because the INPUT from telegram was 9192... and we sliced it to 92...
  // Here the INPUT is 92... 
  // We need to query the DB checking if the DB value *ends with* the input?
  // That requires a LIKE query.

  // Let's stick to the current plan: 
  // If user inputs 919249994425, it finds 919249994425.
  // If user inputs 9249994425, it finds nothing (exact match).
  // Unless we verify what the user meant.
  // The user's DB has `919249994425`
  // User URL: .../9249994425

  // If I want this to work, I need to match the DB record `9192...` using input `92...`.
  // `TRIM(mobilenumber)` is `9192...`.
  // `9192...` != `92...`.
  // So strict equality fails.
  // I need a "ends with" search.

  // Updating Repository to support "Ends With"?
  // Or just update this controller to try adding '91' prefix? 
  // Given the context (India), adding '91' is a safe guess if length is 10.

  if (!data && mobileNumber.length === 10) {
    data = await EmployeeRepository.findByMobileNumber('91' + mobileNumber);
  }

  data ? res.json(data) : res.status(404).json({ message: "Employee not found" });
};