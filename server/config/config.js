// =======================
// Puerto
// Vamos a declarar constantes, variables de forma global
// Process es un objetio global que esta corriendo siempre a lo largo de la aplicacion de node
// es actualizado dentro del entorno o enviroment donde esta corriendo
// =======================

//process.env.PORT esta variable y heroku la actualiza pero no la tenemos en local y vamos a poner el 300
process.env.PORT = process.env.PORT || 3000;

// =======================
// Entorno
// =======================

// Variable que establece heroku: process.env.NODE_ENV
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =======================
// Vencimiento o fecha de expiracion del token (30 dias)
// =======================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias 

process.env.CADUCIDAD_TOKEN = '30d';

// ===============================
// SEED o semilla de autenticación
// ===============================

//No quiero que mi token de produccion  quede visible en github
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// =======================
// Base de datos
// =======================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {

    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;