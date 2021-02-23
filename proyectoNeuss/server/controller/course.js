const express = require('express');
const mysqlConnection = require('../database/database');
const {checkToken, checkAdmin} = require('../middlewares/authentication');
const app = express();

app.get('/course', (req, res) => {
    mysqlConnection.query('SELECT * FROM Course WHERE Stock > 0', (err, courses) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(courses).length == 0) return res.status(400).json({
            ok: false,
            message: "No existen platillos registrados"
        });
        res.json(courses);
    });
});

app.get('/course/all', [checkToken, checkAdmin], (req, res) => {
    mysqlConnection.query('SELECT * FROM Course', (err, courses) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(courses).length == 0) return res.status(400).json({
            ok: false,
            message: "No existen platillos registrados"
        });
        res.json(courses);
    });
});

app.get('/course/:id', checkToken, (req, res) => {
    const {id} = req.params;
    mysqlConnection.query('SELECT * FROM Course WHERE idCourse = ?', id, (err, courses) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(courses).length == 0) return res.status(400).json({
            ok: false,
            message: "Platillo no encontrado"
        });
        res.json(courses);
    });
});

app.post('/course', [checkToken, checkAdmin], (req, res) => {
    let {Name, Stock, Price, Description} = req.body;
    Stock = Stock || 0;
    mysqlConnection.query('INSERT INTO Course SET ?', {Name, Stock, Price, Description}, (err, courses) => {
        if(err) return res.status(400).json({err});
        res.json({
            ok: true,
            course: {Name, Stock, Price, Description}
        });
    });
});

app.put('/course/:id', [checkToken, checkAdmin], (req, res) => {
    let id = req.params.id;
    let body = req.body;
    mysqlConnection.query('SELECT * FROM Course WHERE idCourse = ?', id, (err, findcourse) => {
        if(err) return res.status(400).json({err});
        if(Object.entries(findcourse).length == 0) return res.status(400).json({
            ok: false,
            message: "Platilo no encontrado"
        });
        delete body.idCourse;
        mysqlConnection.query('UPDATE Course SET ? WHERE idCourse = ?', [body, id], (err, courses) => {
            if(err) return res.status(400).json({err});
            res.json({
                ok: true,
                body
            });
        });
    });
});

app.delete('/course/:id', [checkToken, checkAdmin], (req, res) => {
    let id = req.params.id;
    mysqlConnection.query('SELECT * FROM Course WHERE idCourse = ?', id, (err, findCourse) =>{
        if(err) return res.status(400).json({err});
        if(Object.entries(findCourse).length == 0) return res.status(400).json({
            ok: false,
            message: "Platillo no encontrado"
        });
        mysqlConnection.query('UPDATE Course SET ? WHERE idCourse = ?', [{Stock: 0}, id], (err, courses) => {
            if(err) return res.status(400).json({err});
            res.json({ok: true});
        });
    });
});

module.exports = app;