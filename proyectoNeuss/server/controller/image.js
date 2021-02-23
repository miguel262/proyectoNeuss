const express = require('express');
const fs = require('fs');
const path = require('path');
const {checkTokenImg} = require('../middlewares/authentication');
const app = express();

app.get('/image/:type/:img', checkTokenImg, (req, res) => {
    let type = req.params.type;
    let img = req.params.img;
    let pathImg = path.resolve(__dirname, `../uploads/${type}/${img}`);
    if(fs.existsSync(pathImg)) res.sendFile(pathImg);
    else{
        let noImgPath = path.resolve(__dirname, '../assets/no-image.png');
        res.sendFile(noImgPath);
    }
});

module.exports = app;