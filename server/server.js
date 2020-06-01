require('./config/config');

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path'); //esto no requiere hacer un npm install porque es un paquete nativo de node
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
//app.use es un midelware y signfica que cada peticion va a pasar por aqui
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

// Habilitar la carpeta public

// si ponemos asi no funciona app.use( express.static( __dirname + './../public'));  
//porque al hacer console.log(__dirname + './../public');
//imprime C:\Users\Marisol\Desktop\node\07-restserver\server./../public por eso hay que usar path

app.use(express.static(path.resolve(__dirname, './../public')));

//Aqui podriamos llegar a tener muchas importaciones de rutas 
//lo ideal es que tengamos una sola importacion que me cargue todas las rutas
//para ello creamos el index.js e incluimos alli todas las rutas
// app.use(require('./routes/usuario'));
// app.use(require('./routes/login'));

app.use(require('./routes/index')); //configuración global de rutas

//establecemos la conexion a bbdd y el nombre del esquema a crear, ver config.js
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
    (err, res) => {
        if (err) {
            throw err;
        }
        console.log('Base de datos ONLINE');
    });

app.listen(process.env.PORT, () => {
    console.log('Escuchando en el puerto', process.env.PORT);

});