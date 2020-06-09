const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.get('/', (req, res, next) => {
    db.all(
        `SELECT * FROM Timesheet
        WHERE Timesheet.employee_id = ${req.params.employeeId}`,
        (error, rows) => {
            if (error) {
                next(error);
            } else {
                res.status(200).json({timesheets: rows});
            }
        }
    );
});

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;

    if (!hours || !rate || !date) {
        res.sendStatus(400);
    } else {
        db.run(
            `INSERT INTO Timesheet (hours, rate, date, employee_id)
            VALUES ($hours, $rate, $date, $employee_id)`,
            {
                $hours: hours,
                $rate: rate,
                $date: date,
                $employee_id: employeeId
            },
            function(error) {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM Timesheet
                        WHERE Timesheet.id = ${this.lastID}`,
                        (error, row) => {
                            res.status(201).json({timesheet: row});
                        }
                    );
                }
            }
        );
    }
});

module.exports = timesheetsRouter;