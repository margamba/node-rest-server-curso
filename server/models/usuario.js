const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); //es necesario definir cual es el campo unique

//para definir un enum
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
}

//Obtener el cascaron para crear esquemas de mongoose
let Schema = mongoose.Schema;

//campos de la coleccion
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    email: {
        type: String,
        unique: true, //hay que definirlo para usar el uniqueValidator
        required: [true, 'El correo es requerido']
    },
    password: {
        type: String,
        required: [true, 'La constraseña es requerida']
    },
    img: {
        type: String,
        required: false //se puede no poner
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    },

});


//el password sabemos que nunca lo vamos a mostrar
//el metodo toJSON siempre se llama cuando se intenta imprimir
//no usar una funcion de flecha aqui porq necesitamos el this 
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

//especificamos el nombre que le queremos dar fisicamente a este modelo 
//ese usuario va tener toda la configuracionde usuarioSchema
//tenemos que decirlte al esquema que use un plugin en particular

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);