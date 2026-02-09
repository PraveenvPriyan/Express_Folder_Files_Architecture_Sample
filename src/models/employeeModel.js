class Employee {
  constructor(id, name, email, mobilenumber, empcode, isactive) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.mobilenumber = mobilenumber; // Set to null when returning to client
    this.empcode = empcode;
    this.isactive = isactive;
  }
}

module.exports = Employee;