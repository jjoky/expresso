const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('employeeId', (req, res, next, employeeId) =>{
    db.get(
        `SELECT * FROM Employee
        WHERE id = ${employeeId}`,
        (error, row) => {
            if (error) {
                next(error);
            } else if (row) {
                req.employee = row;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    );
});

employeesRouter.get('/', (req, res, next) => {
    db.all(
        `SELECT * FROM Employee WHERE is_current_employee = 1`,
        (error, rows) => {
            if (error){
                next(error);
            } else {
                res.status(200).json({employees: rows})
            }
        }
    );
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee})
});

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

    if (!name || !position || !wage) {
        res.sendStatus(400);
    } else {
        db.run(
            `INSERT INTO Employee (name, position, wage, is_current_employee)
            VALUES ($name, $position, $wage, $isCurrentEmployee)`,
            {
                $name: name,
                $position: position,
                $wage: wage,
                $isCurrentEmployee: isCurrentEmployee
            },
            function(error) {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM Employee
                        WHERE Employee.id = ${this.lastID}`,
                        (error, row) => {
                            if (error) {
                                next(error);
                            } else {
                                res.status(201).json({employee: row})
                            }
                        }
                    );
                }
            }
        );
    }
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

    if (!name || !position || !wage) {
        res.sendStatus(400);
    } else {
        db.run(
            `UPDATE Employee
            SET name = $name,
            position = $position,
            wage = $wage,
            is_current_employee = $isCurrentEmployee
            WHERE Employee.id = $employeeId`,
            {
                $name: name,
                $position: position,
                $wage: wage,
                $isCurrentEmployee: isCurrentEmployee,
                $employeeId: req.params.employeeId
            },
            (error) => {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM Employee
                        WHERE Employee.id = ${req.params.employeeId}`,
                        (error, row) => {
                            if (error) {
                                next(error);
                            } else {
                                res.status(200).json({employee: row})
                            }
                        }
                    );
                }
            }
        )
    }
});

module.exports = employeesRouter;