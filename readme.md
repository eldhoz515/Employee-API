CRUD features in Node JS API  :
    · Create Employee with multiple contact details (Relationship mapping)
    · List Employee (with pagination)
    · Update Employee
    · Delete Employee
    · Get Employee

This implementation assumes that you have a MySQL database named `employees` with two tables: `employees` and `contacts`.

The `employees` table has the following columns:

- `id` (auto-incrementing primary key)
- `full_name`
- `job_title`
- `phone_number`
- `email`
- `address`
- `city`
- `state`
- `primary_emergency_contact_name`
- `primary_emergency_contact_phone_number`
- `primary_emergency_contact_relationship`
- `secondary_emergency_contact_name`
- `secondary_emergency_contact_phone_number`
- `secondary_emergency_contact_relationship`

The `contacts` table has the following columns:

- `id` (auto-incrementing primary key)
- `employee_id` (foreign key to `employees.id`)
- `name`
- `phone_number`
- `relationship`