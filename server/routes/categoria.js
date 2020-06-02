const express = require('express');

const _ = require('underscore');

let { verificaToken, verificaAdminRole } = require('./../middlewares/autenticacion');

let app = express();


let Categoria = require('./../models/categoria');

// ============================
// Mostrar todas las categorias
// ============================

//populate verifica que objectsId existen en la categoria, 
//como primer parametro va el nombre de la propiedad que es el objectId que es usuario,
//segundo parametro son las propiedades del usuario que quiero mostrar
//si tuviesemos otros objetos que quisieramos mostrar agregariamos otro populate

//sort es para ordenar
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });

        });


});

// ===========================
// Mostrar una categoría por ID
// ===========================

app.get('/categoria/:id', (req, res) => {

    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    })


});

// ==============================
// Crear nueva categoría
// ==============================
app.post('/categoria', verificaToken, (req, res) => {
    //regresa la nueva categoría
    //req.usuario._id

    let body = req.body;
    let usuario = req.usuario;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: usuario._id
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });


});

// ==============================
// Actualizar categoría
// ==============================

app.put('/categoria/:id', verificaToken, (req, res) => {
    //regresa la nueva categoría
    //req.usuario_id

    let id = req.params.id;
    // let body = _.pick(req.body, ['descripcion']);

    let descCategoria = {
        descripcion: req.body.descripcion
    };

    //si pongo runValidators: true  da error
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });


});

// ==============================
// Borrado de categoría
// ==============================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    //solo administrador puede borrar categorías
    //fisicamente se va a borrar
    //Categoria.findByIdAndRemove


    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoría borrada'
        });

    });
});


module.exports = app;