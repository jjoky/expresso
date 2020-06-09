const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.param('menuId', (req, res, next, menuId) => {
    db.get(
        `SELECT * FROM Menu WHERE Menu.id = ${menuId}`,
        (error, row) => {
            if (error) {
                next(error);
            } else if (row) {
                req.menu = row;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    );
});

menusRouter.get('/', (req, res, next) => {
    db.all(
        `SELECT * FROM Menu`,
        (error, rows) => {
            if (error) {
                next(error);
            } else {
                res.status(200).json({menus: rows});
            }
        }
    );
});

menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

module.exports = menusRouter;