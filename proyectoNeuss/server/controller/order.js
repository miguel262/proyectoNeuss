const express = require('express');
const mysqlConnection = require('../database/database');
const {checkToken, checkAdmin} = require('../middlewares/authentication');
const app = express();

app.get('/order', [checkToken], (req, res) => {
    mysqlConnection.query('SELECT * FROM `Order`', (err, orders) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(orders).length == 0) return res.status(400).json({
            ok: false,
            message: "No existen ordenes registradas"
        });
        return res.json(orders);
    });
});

app.get('/order/user/:idUser', [checkToken], (req, res) => {
    let idUser = req.params.idUser;
    mysqlConnection.query('SELECT * FROM User JOIN Customer USING(idUser) WHERE idUser = ?', idUser, (err, userDB) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(userDB).length == 0) return res.status(400).json({
            ok: false,
            message: "Cliente no encontrado"
        });
        let idCustomer = userDB[0].idCustomer;
        mysqlConnection.query('SELECT * FROM `Order` WHERE idCustomer = ?', idCustomer, (err, orderDB) => {
            if(err) return res.status(400).json({err});
            if(Object.entries(orderDB).length == 0) return res.status(400).json({
                ok: false,
                message: "Cliente no registra ordenes"
            });
            delete orderDB[0].idCustomer;
            orderDB[0].idUser = idUser;
            return res.json({orderDB});
        });
    });
});

app.get('/order/:idOrder', [checkToken], (req, res) => {
    let id = req.params.idOrder;
    mysqlConnection.query('SELECT idCourse FROM CourseOrder WHERE idOrder = ?', id, (err, orderDB) => {
        if(err) return res.status(400).json({err});
            if(Object.entries(orderDB).length == 0) return res.status(400).json({
                ok: false,
                message: "Orden no encontrada"
        });
        return res.json({orderDB});
    });
});

app.post('/order/:id', [checkToken], (req, res) => {
    let id = req.params.id;
    let body = req.body;
    if(Object.entries(body).length == 0) return res.status(400).json({
        ok: false,
        message: "No se agregaron platillos"
    });
    let data = new Object();
    data.Date = (body.pop()).Date;
    data.Status = "En revision"
    if (!data.Date) return res.status(400).json({
        ok: false,
        message: "No se ingreso Date en la ultima posicion del objeto"
    });
    mysqlConnection.query('SELECT idCustomer FROM Customer WHERE idUser = ?', id, (err, customerDB) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(customerDB).length == 0) return res.status(400).json({
            ok: false,
            message: "Cliente no encontrado"
        });
        data.idCustomer = customerDB[0].idCustomer;
        mysqlConnection.query('INSERT INTO `Order` SET ?', data, (err, orderDB) => {
            if(err) return res.status(400).json({err});
            let idOrder = orderDB.insertId;
            for(i in body){
                let idCourse = body[i].idCourse;
                mysqlConnection.query('INSERT INTO CourseOrder SET ?', {idOrder, idCourse});
            };
            return res.json({
                ok: true,
                idOrder,
                Status: "En revision"
            });
        });
    });
});

app.put('/order/:id', [checkToken, checkAdmin], (req, res) => {
    let id = req.params.id;
    let {Status} = req.body;
    mysqlConnection.query('SELECT * FROM `Order` WHERE idOrder = ?', id, (err, orderDB) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(orderDB).length == 0) return res.status(400).json({
            ok: false,
            message: "Orden no encontrado"
        });
        let check = ["En revision", "En preparacion", "En camino", "Entregado"];
        let cont = false;
        for(i in check) if(Status === check[i]) cont = true;
        if(cont) {
            mysqlConnection.query('UPDATE `Order` SET ? WHERE idOrder = ?', [{Status}, id]);
            return res.json({
               ok: true,
               idOrder: id,
               Status 
            });
        }
        else res.status(400).json({
            ok: false,
            message: "Estatus no valido",
            arg: "En preparacion, En camino o Entregado"
        });
    });
});

app.delete('/order/:id', [checkToken], (req, res) => {
    let id = req.params.id;
    mysqlConnection.query('SELECT * FROM `Order` WHERE idOrder = ?', id, (err, orderDB) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(orderDB).length == 0) return res.status(400).json({
            ok: false,
            message: "Orden no encontrado"
        });
        mysqlConnection.query('UPDATE `Order` SET ? WHERE idOrder = ?', [{Status: "Cancelado"}, id]);
        return res.json({
            ok: true,
            idOrder: id,
            Status: "Cancelado"
        });
    });
});

module.exports = app;