const express = require('express');
const bcrypt = require('bcrypt');
const mysqlConnection = require('../database/database');
const {checkToken, checkAdmin} = require('../middlewares/authentication');
const app = express();

app.get('/customer', [checkToken, checkAdmin], (req, res) => {
    mysqlConnection.query('SELECT idUser, Name, LastName, Email, Address, Phone FROM User JOIN Customer USING(idUser)', (err, customers) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(customers).length == 0) return res.status(400).json({
            ok: false,
            message: "No existen clientes registrados"
        });
        return res.json(customers);
    });
});

app.get('/customer/:id', [checkToken, checkAdmin], (req, res) => {
    const id = req.params.id;
    mysqlConnection.query('SELECT idUser, Name, LastName, Email, Address, Phone FROM User JOIN Customer USING(idUser) WHERE idUser = ?', id, (err, customers) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(customers).length == 0) return res.status(400).json({
            ok: false,
            message: "Cliente no encontrado"
        });
        return res.json(customers);
    });
});

app.post('/customer', (req, res) => {
    let {Name, LastName, Email, Password, Address, Phone} = req.body;
    mysqlConnection.query('SELECT * FROM User WHERE Email = ?', Email, (err, userDB) => {
        if(Object.entries(userDB).length != 0) return res.json({
            ok: false,
            message: "Correo Utilizado"
        });
        Password = bcrypt.hashSync(Password, saltRounds);
        mysqlConnection.query('INSERT INTO User SET ?', {Name, LastName, Email, Password} , (err, users) => {
            if(err) return res.status(400).json({
                ok: false,
                message: "Error en los argumentos",
                arg: "Name, LastName, Email, Password, Address, Phone"
            });
            idUser = users.insertId;
            mysqlConnection.query('INSERT INTO Customer SET ?', {Address, Phone, idUser}, (err, customers) => {
                if(err){
                    mysqlConnection.query('DELETE FROM User WHERE idUser = ?', idUser);
                    return res.status(400).json({
                        ok: false,
                        message: "Error en los argumentos",
                        arg: "Name, LastName, Email, Password, Address, Phone"
                    });
                }
                return res.json({
                    ok: true,
                    customer: {idUser, Name, LastName, Email, Address, Phone}
                });
            });
        });
    });
});

app.put('/customer/:id', checkToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    mysqlConnection.query('SELECT * FROM User JOIN Customer USING(idUser) WHERE idUser = ?', id, (err, findUser) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(findUser).length == 0) return res.status(400).json({
            ok: false,
            message: "Cliente no encontrado"
        });
        if(body.Password) body.Password = bcrypt.hashSync(body.Password, saltRounds);
        ['idUser', 'idCustomer'].forEach((k) => {delete body[k]});
        mysqlConnection.query('UPDATE User JOIN Customer USING(idUser) SET ? WHERE idUser = ?', [body, id], (err, users) => {
            if(err) return res.status(400).json({err});
            res.json({
                ok: true,
                body
            });
        });
    });
});

app.delete('/customer/:id', checkToken, (req, res) => {
    let id = req.params.id;
    mysqlConnection.query('SELECT * FROM User JOIN Customer USING(idUser) WHERE idUser = ?', id, (err, findUser) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(findUser).length == 0) return res.status(400).json({
            ok: false,
            message: "Cliente no encontrado"
        });
        mysqlConnection.query('DELETE FROM Customer WHERE idUser = ?', id);
        mysqlConnection.query('DELETE FROM User WHERE idUser = ?', id);
        return res.json({ok: true});
    });
});

module.exports = app;