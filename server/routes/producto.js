const express = require('express');

const _ = require('underscore');

const { verificaToken } = require('./../middlewares/autenticacion');

let app = express();

let Producto = require('./../models/producto');

// ==============================
// Obtener productos
// ==============================

app.get('/productos', verificaToken, (req, res) => {
    //trae todos los productos
    //populate: usuario y categoria
    //paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5; //registros por pagina
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.count({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    total: conteo
                });
            });

        });

});

// ==============================
// Obtener producto por ID
// ==============================

app.get('/productos/:id', verificaToken, (req, res) => {
    //trae producto


    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });


});

// ==============================
// Buscar productos
// ==============================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i') //i es que no sea sensible a may y min

    Producto.find({ nombre: regex, disponible: true })
        .populate()
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })

        });

});

// ==============================
// Crear un producto
// ==============================
app.post('/productos', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado

    let body = req.body;
    let usuario = req.usuario;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoriaId,
        usuario: usuario._id
    });

    producto.save((err, productoDB) => {

        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        };
        //201 crea nuevo registro
        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });

});

// ==============================
// Actualizar un producto
// ==============================

app.put('/productos/:id', (req, res) => {

    let id = req.params.id
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'categoria']);

    // delete body.password;
    // delete body.google;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });

});

// ==============================
// Borrar un producto
// ==============================
app.delete('/productos/:id', (req, res) => {
    //no se debe borrar fisicamente, solo pasar la propiedad disponible a false
    let id = req.params.id;

    let cambiaDisponible = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaDisponible, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado,
            mensaje: 'Producto borrado'
        });
    });

});


module.exports = app;