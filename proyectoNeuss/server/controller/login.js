const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysqlConnection = require('../database/database');
const app = express();

app.post('/login', (req, res) => {
    let body = req.body;
    mysqlConnection.query('SELECT * FROM User WHERE Email = ?', body.Email, (err, userDB) => {
        if(Object.entries(userDB).length == 0) return res.status(400).json({
            ok: false,
            message: "Email o contraseña invalidos"
        });
        if(!bcrypt.compareSync(body.Password, userDB[0].Password)) return res.status(400).json({
            ok: false,
            message: "Email o contraseña invalidos"
        });
        let {idUser, Name, LastName, Email, Img} = userDB[0];
        let token = jwt.sign(
            {user: {idUser, Name, LastName, Email, Img}},
            process.env.SEED,
            {expiresIn: process.env.EXPIRATION_TOKEN}  
        );
        res.json({
            ok: true,
            user: {idUser, Name, LastName, Email, Img},
            token
        });
    });
});

module.exports = app;