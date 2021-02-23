const jwt = require('jsonwebtoken');
const mysqlConnection = require('../database/database');

let checkToken = (req, res, next) => {
    let token = req.get('token');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if(err) return res.status(401).json({
            ok: false,
            err: "Token no valido o no ingresado"
        });
        req.user = decoded.user;
        next();
    });
}

let checkAdmin = (req, res, next) => {
    let idUser = req.user.idUser;
    mysqlConnection.query('SELECT * FROM User JOIN Admin USING(idUser) WHERE idUser = ?', idUser, (err, adminDB) => {
        if(Object.entries(adminDB).length == 0) return res.status(400).json({
            ok: false,
            message: "No es administrador"
        });
        next();
    });
}

let checkTokenImg = (req, res, next) => {
    let token = req.query.token;
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if(err) return res.status(401).json({err});
        req.user = decoded.user;
        next();
    });
}

module.exports = {
    checkToken,
    checkAdmin,
    checkTokenImg
}