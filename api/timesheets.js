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

module.exports = timesheetsRouter;