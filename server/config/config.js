// =======================
// Puerto
// Vamos a declarar constantes, variables de forma global
// Process es un objetio global que esta corriendo siempre a lo largo de la aplicacion de node
// es actualizado dentro del entorno o enviroment donde esta corriendo
// =======================

//process.env.PORT esta variable y heroku la actualiza pero no la tenemos en local y vamos a poner el 300
process.env.PORT = process.env.PORT || 3000;