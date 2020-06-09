const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menu-items');

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

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

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

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;

    if (!title) {
        res.sendStatus(400);
    } else {
        db.run(
            `INSERT INTO Menu (title) VALUES ($title)`,
            {$title: title},
            function (error) {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
                        (error, row) => {
                            res.status(201).json({menu: row});
                        }
                    );
                }
            }
        );
    }
});

menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    const menuId = req.params.menuId;

    if (!title) {
        res.sendStatus(400);
    } else {
        db.run(
            `UPDATE Menu SET title = $title
            WHERE Menu.id = $menuId`,
            {
                $title: title,
                $menuId: menuId
            },
            function (error) {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM Menu WHERE Menu.id = ${menuId}`,
                        (error, row) => {
                            res.status(200).json({menu: row});
                        }
                    );
                }
            }
        );
    }
});

menusRouter.delete('/:menuId', (req,res, next) => {
    const menuId = req.params.menuId;
    
    db.get(
        `SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${menuId}`,
        (error, row) => {
            if (error) {
                next(error);
            } else if (row) {
                res.sendStatus(400);
            } else {
                db.run(
                    `DELETE FROM Menu WHERE Menu.id = ${menuId}`,
                    (error) => {
                        res.sendStatus(204);
                    }
                );
            }
        }
    );
})


module.exports = menusRouter;