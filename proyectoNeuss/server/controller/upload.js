const express = require('express');
const fileUpload = require('express-fileupload');
const mysqlConnection = require('../database/database');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(fileUpload());

app.put('/upload/:type/:id', (req, res) => {
    if(!req.files) return res.status(400).json({
        ok: false,
        message: "No se ha seleccionado un archivo"
    });
    let file = req.files.file;
    let type = req.params.type;
    let id = req.params.id;
    let extension = getExtension(file.name);
    if(!checkType(type)) return res.status(400).json({
        ok: false,
        message: "Type no valido",
        args: "user o course"
    });
    if(!checkExtension(extension)) return res.status(400).json({
        ok: false,
        message: "Extension no valida",
        args: "jpg, jpeg, png"
    });
    let fileName = `${id}-${new Date().getMilliseconds()}.${extension}`;
    file.mv(`server/uploads/${type}/${fileName}`, (err) => {
        if(err) return res.status(500).json({err});
        if(type === "user") userImage(id, res, fileName);
        else courseImage(id, res, fileName);
    });
});

function getExtension(fileName){
    let cutName = fileName.split('.');
    return cutName[cutName.length-1];
}

function checkType(type){
    let validType = ["user", "course"];
    if(validType.indexOf(type) == -1) return false;
    else return true;
}

function checkExtension(extension){
    let validType = ["jpg", "jpeg", "png"];
    if(validType.indexOf(extension) == -1) return false;
    else return true;
}

function userImage(id, res, fileName){
    mysqlConnection.query('SELECT * FROM User WHERE idUser = ?', id, (err, userDB) => {
        if(err){
            delFile('user', fileName);
            return res.status(500).json({err})
        }
        if(Object.entries(userDB).length == 0){
            delFile('user', fileName);
            return res.status(400).json({
                ok: false,
                message: "Usuario no encontrado"
            });
        }
        let {Name, LastName, Email} = userDB[0];
       if(userDB[0].Img != null) delFile('user', userDB[0].Img);
        mysqlConnection.query('UPDATE User SET ? WHERE idUser = ?', [{Img: fileName}, id]);
        return res.json({
            ok: true,
            userDB: {
                idUser: id,
                Name,
                LastName,
                Email,
                Img: fileName
            }
        });
    });
}

function courseImage(id, res, fileName){
    mysqlConnection.query('SELECT * FROM Course WHERE idCourse = ?', id, (err, courseDB) => {
        if(err){
            delFile('course', fileName);
            return res.status(500).json({err})
        }
        if(Object.entries(courseDB).length == 0){
            delFile('course', fileName);
            return res.status(400).json({
                ok: false,
                message: "Platillo no encontrado"
            });
        }
        let {Name, Stock, Price, Description} = courseDB[0];
       if(courseDB[0].Img != null) delFile('course', courseDB[0].Img);
        mysqlConnection.query('UPDATE Course SET ? WHERE idCourse = ?', [{Img: fileName}, id]);
        return res.json({
            ok: true,
            courseDB: {
                idCourse: id,
                Name,
                Stock,
                Price,
                Description,
                Img: fileName
            }
        });
    });
}

function delFile(type, imgName){
    let pathImg = path.resolve(__dirname, `../uploads/${type}/${imgName}`);
    if(fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
}

module.exports = app;