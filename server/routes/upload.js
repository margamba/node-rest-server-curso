const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('./../models/usuario');
const Producto = require('./../models/producto');

//file system y path existen por defecto en node  (no hay que hacer install)
const fs = require('fs');
const path = require('path')

// Este  Middelware: transforma lo que sea que se este subiendo y lo coloca en un objeto llamado files 
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {


    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningun archivo'
                }

            });
    }

    let tipo = req.params.tipo;
    let id = req.params.id;

    //Validar tipo

    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos  son ' + tiposValidos.join(', '),
                tipo
            }
        });
    }





    // archivo sera el nombre del input o campo que se usara para recibir  el archivo a subir
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        console.log(extensionesValidas.indexOf('extension'));
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los extensiones permitidas son ' + extensionesValidas.join(', '),
                extension
            }
        })
    }

    //Cambiar el nombre del archivo
    //le adjuntamos los milisegundos actuales (0-999) para que lo haga unico 
    // y prevenir el cache del navegador

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Usamos el metod  mv() para colocar el archivo en el directorio  uploads del  servidor
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        //Aqui,  imagen ya cargada
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

    });

});
//Actualiza el  nombre de la  imagen del usuario en BBDD y borra la imagen anterior del servidor 
//id es el id del usuario que me viene en la peticion
// debemos pasar como un parametro el res y js cuando son objetos  siempre los pasa por referencia
function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });

        }

        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo

            })

        })

    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });

        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo

            })

        })

    });
}

function borraArchivo(nombreImagen, tipo) {

    //los parametros del resolve, son segmentos del path que quiero construir
    let pathImg = path.resolve(__dirname, `./../../uploads/${tipo}/${nombreImagen}`);
    //existsSync es sincrona, la opcion exist funciona con callbacks

    if (fs.existsSync(pathImg)) {
        //path de imagen que quiero borrar, si damos un path de una imagen que no existe daria error
        fs.unlinkSync(pathImg);

    }
}

module.exports = app;