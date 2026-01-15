class Employee {
  constructor(id, name, email, password, designation) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password; // Set to null when returning to client
    this.designation = designation;
  }
}

module.exports = Employee;