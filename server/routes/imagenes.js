const express = require('express');
const fs = require('fs');
const path = require('path')
let app = express();
const { verificaTokenImg } = require('./../middlewares/autenticacion');

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img

    let pathImg = path.resolve(__dirname, `./../../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {

        //Aqui definimos un path absoluto
        let pathImgNotFound = path.resolve(__dirname, './../assets/img_not_found.jpg')

        //lee el contentype del archivo y es lo que retorna
        res.sendFile(pathImgNotFound);
    }
});

module.exports = app;