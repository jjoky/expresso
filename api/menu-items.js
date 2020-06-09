const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req,res, next, menuItemId) => {
    db.get(
        `SELECT * FROM MenuItem
        WHERE MenuItem.id = ${req.params.menuItemId}`,
        (error, row) => {
            if (error) {
                next(error);
            } else if (row) {
                next();
            } else {
                res.sendStatus(404);
            }
        }
    );
});

menuItemsRouter.get('/', (req, res, next) => {
    db.all(
        `SELECT * FROM MenuItem
        WHERE MenuItem.menu_id = ${req.params.menuId}`,
        (error, rows) => {
            if (error) {
                next(error);
            } else {
                res.json({menuItems: rows});
            }
        }
    );
});

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;

    if (!name || !inventory || !price) {
        res.sendStatus(400);
    } else {
        db.run(
            `INSERT INTO MenuItem (name, description, inventory, price, menu_id)
            VALUES ($name, $description, $inventory, $price, $menuId)`,
            {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId
            },
            function (error) {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM MenuItem
                        WHERE MenuItem.id = ${this.lastID}`,
                        (error, row) => {
                            res.status(201).json({menuItem: row});
                        }
                    );
                }
            }
        );
    }
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;
    const menuItemId = req.params.menuItemId;

    if (!name || !inventory || !price) {
        res.sendStatus(400);
    } else {
        db.run(
            `UPDATE MenuItem
            SET name = $name,
            description = $description,
            inventory = $inventory,
            price = $price,
            menu_id = $menuId
            WHERE MenuItem.id = $menuItemId`,
            {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId,
                $menuItemId: menuItemId
            },
            function (error) {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM MenuItem
                        WHERE MenuItem.id = ${menuItemId}`,
                        (error, row) => {
                            res.json({menuItem: row});
                        }
                    );
                }
            }
        );
    }
});


module.exports = menuItemsRouter;