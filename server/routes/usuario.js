const express = require('express');

const bcrypt = require('bcrypt');

const _ = require('underscore');

const Usuario = require('./../models/usuario');

const { verificaToken, verificaAdminRole } = require('./../middlewares/autenticacion');

const app = express();

//verificaToken es un middleware que se debe disparar cuando se accede a  esta ruta
//es decir que se ejecuta el codigo de verificaToken y como este tiene un next, va continuar con el codigo aqui definido
app.get('/usuario', verificaToken, function(req, res) {


    //los parametros opcionales caen dentro de un objeto .query (en postman son los query params o que van ? en url)
    let desde = req.query.desde || 0; //si no viene el parametro quiere decir que coja desde el registro que esta en la posicion 0
    desde = Number(desde);

    let limite = req.query.limite || 5; //registros por pagina
    limite = Number(limite);
    //el segundo parametro para indicar que propiedades queremos mostrar 
    Usuario.find({ estado: true }, 'nombre email role google estado') //si quiereo poner un filtro  pongo por ej { estado: true }
        .skip(desde) //se salta los primeros 5
        .limit(limite) //para que me retorne solo 5 usuarios, si no se pone retorna todos
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //nos da el total de registros , //si quiereo poner un filtro  pongo { google: true }
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    total: conteo
                });
            });



        })

});

app.post('/usuario', [verificaToken, verificaAdminRole], function(req, res) {
    let body = req.body;

    //creamos el usuario y lo inicializamos con los valores que vengan en cuerpo de la peticion
    //Para que haga el hash de forma sincrona, es decir que no use un callback o una promesa que lo haga directamente
    //Recibe dos parametros,   el campo a ecriptar y el numero de vueltas que quiero aplicarle a ese hash
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //lo grabamos en la BBDD. save es palabra reservada moongose
    //respuesta del usuario que se grabo en mongo
    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //usuarioDB.password = null;  en la respuesta se seguiria mostrando el password a null, pero es mejor no mostrar nada

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });



});

// Una forma de hacerlo seria la siguiente
// Usuario.findById(id, (err, usuarioDB) => { usuarioDB.save}

//Otra forma seria findByIdAndUpdate, donde el segundo parametro seria lo que vamos a actualizar
//si hacemos Usuario.findByIdAndUpdate(id, body, (err, usuarioDB)
// en la respuesta nos regresa el usuario antes de actualizar
//para que lo regrese actualizado debemos mandar opciones {new : true}
//aqui por ej no se hace la validacion de los roles validos, para que se haga 
//es ncesario colocar la opcion runValidators
//aqui podria modificar el password y se guardaria sin encriptar
//se podria hacer delete body.password pero no es eficiente
//existe la libreria underscore que expande cosas que js deberia tener por defecto
//se manda arreglo con los campos que quiero que se actualicen

app.put('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {

    let id = req.params.id
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    // delete body.password;
    // delete body.google;

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {

    let id = req.params.id;

    let cambiaEstado = {
        estado: false

    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    })

});
// asi se borra el registro fisicamente
/* app.delete('/usuario/:id', function(req, res) {

    let id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    })

}); */

// asi lo hice yo y funciona pero no es la forma
/* app.delete('/usuario/:id', function(req, res) {

    let id = req.params.id;

    Usuario.find({ id: id })
        .exec((err, usuario) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }


            usuario.estado = false;
            let body = _.pick(usuario, ['estado']);

            Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioDB) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    usuario: usuarioDB
                });
            });

        });

}); */


module.exports = app;