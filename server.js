const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employees'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.get('/employees', (req, res) => {
    // List all employees with pagination
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    connection.query('SELECT * FROM employees LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/employees', (req, res) => {
    // Create a new employee with contact details
    const employee = req.body;
    const contacts = employee.contacts;

    connection.beginTransaction((err) => {
        if (err) throw err;

        connection.query('INSERT INTO employees SET ?', employee, (err, result) => {
            if (err) {
                return connection.rollback(() => {
                    throw err;
                });
            }

            const employeeId = result.insertId;

            contacts.forEach((contact) => {
                contact.employee_id = employeeId;
                connection.query('INSERT INTO contacts SET ?', contact, (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            throw err;
                        });
                    }
                });
            });

            connection.commit((err) => {
                if (err) {
                    return connection.rollback(() => {
                        throw err;
                    });
                }
                res.json({ message: 'Employee created successfully' });
            });
        });
    });
});

app.put('/employees/:id', (req, res) => {
    // Update an employee and their contact details
    const employeeId = req.params.id;
    const employee = req.body;
    const contacts = employee.contacts;

    connection.beginTransaction((err) => {
        if (err) throw err;

        connection.query('UPDATE employees SET ? WHERE id = ?', [employee, employeeId], (err) => {
            if (err) {
                return connection.rollback(() => {
                    throw err;
                });
            }

            connection.query('DELETE FROM contacts WHERE employee_id = ?', employeeId, (err) => {
                if (err) {
                    return connection.rollback(() => {
                        throw err;
                    });
                }

                contacts.forEach((contact) => {
                    contact.employee_id = employeeId;
                    connection.query('INSERT INTO contacts SET ?', contact, (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                throw err;
                            });
                        }
                    });
                });

                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            throw err;
                        });
                    }
                    res.json({ message: 'Employee updated successfully' });
                });
            });
        });
    });
});

app.delete('/employees/:id', (req, res) => {
    // Delete an employee and their contact details
    const employeeId = req.params.id;

    connection.beginTransaction((err) => {
        if (err) throw err;
        connection.query('DELETE FROM employees WHERE id = ?', employeeId, (err) => {
            if (err) {
                return connection.rollback(() => {
                    throw err;
                });
            }

            connection.query('DELETE FROM contacts WHERE employee_id = ?', employeeId, (err) => {
                if (err) {
                    return connection.rollback(() => {
                        throw err;
                    });
                }

                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            throw err;
                        });
                    }
                    res.json({ message: 'Employee deleted successfully' });
                });
            });
        });
    });
});

app.get('/employees/:id', (req, res) => {
    // Get an employee by id
    const employeeId = req.params.id;

    connection.query('SELECT * FROM employees WHERE id = ?', employeeId, (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            res.status(404).json({ message: 'Employee not found' });
        } else {
            connection.query('SELECT * FROM contacts WHERE employee_id = ?', employeeId, (err, contacts) => {
                if (err) throw err;

                results[0].contacts = contacts;
                res.json(results[0]);
            });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});  