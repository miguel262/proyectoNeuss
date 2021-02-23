const express = require('express');
const bcrypt = require('bcrypt');
const mysqlConnection = require('../database/database');
const {checkToken, checkAdmin} = require('../middlewares/authentication');
const app = express();

app.get('/admin', [checkToken, checkAdmin], (req, res) => {
    mysqlConnection.query('SELECT idUser, Name, LastName, Email FROM User JOIN Admin USING(idUser)', (err, admins) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(admins).length == 0) return res.status(400).json({
            ok: false,
            message: "No existen administradores registrados"
        });
        res.json(admins);
    });
});

app.get('/admin/:id', [checkToken, checkAdmin], (req, res) => {
    const id = req.params.id;
    mysqlConnection.query('SELECT Name, LastName, Email FROM User JOIN Admin USING(idUser) WHERE idUser = ?', id, (err, admins) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(admins).length == 0) return res.status(400).json({
            ok: false,
            message: "Administrador no encontrado"
        });
        res.json(admins);
    });
});

app.post('/admin', [checkToken, checkAdmin], (req, res) => {
    let {Name, LastName, Email, Password} = req.body;
    mysqlConnection.query('SELECT * FROM User WHERE Email = ?', Email, (err, userDB) => {
        if(Object.entries(userDB).length != 0) return res.json({
            ok: false,
            message: "Correo Utilizado"
        });
        Password = bcrypt.hashSync(Password, saltRounds);
        mysqlConnection.query('INSERT INTO User SET ?', {Name, LastName, Email, Password}, (err, users) => {
            if(err) return res.status(400).json({
                ok: false,
                message: "Error en los argumentos",
                arg: "Name, LastName, Email, Password"
            });
            idUser = users.insertId;
            mysqlConnection.query('INSERT INTO Admin SET ?', {idUser}, (err, adminDB) => {
                if(err) return res.status(400).json({err});
                res.json({
                    ok: true,
                    admin: {Name, LastName, Email}
                });
            });
        });
    });
});

app.put('/admin/:id', [checkToken, checkAdmin], (req, res) => {
    let id = req.params.id;
    let body = req.body;
    mysqlConnection.query('SELECT * FROM User JOIN Admin USING(idUser) WHERE idUser = ?', id, (err, findAdmin) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(findAdmin).length == 0) return res.status(400).json({
            ok: false,
            message: "Administrador no encontrado"
        });
        if(body.Password) body.Password = bcrypt.hashSync(body.Password, saltRounds);
        ['idUser', 'idAdmin'].forEach((k) => {delete body[k]});
        mysqlConnection.query('UPDATE User JOIN Admin USING(idUser) SET ? WHERE idUser = ?', [body, id], (err, admins) => {
            if(err) return res.status(400).json({err});
            res.json({
                ok: true,
                body
            });
        });
    });
});

app.delete('/admin/:id', [checkToken, checkAdmin], (req, res) => {
    let id = req.params.id;
    mysqlConnection.query('SELECT * FROM User JOIN Admin USING(idUser) WHERE idUser = ?', id, (err, findUser) => {
        if(Object.entries(findUser).length == 0) return res.status(400).json({
            ok: false,
            message: "Administrador no encontrado"
        });
        mysqlConnection.query('DELETE FROM Admin WHERE idUser = ?', id)
        mysqlConnection.query('DELETE FROM User WHERE idUser = ?', id)
        res.json({ok: true});
    });
});

module.exports = app;