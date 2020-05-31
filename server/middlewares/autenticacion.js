const jwt = require('jsonwebtoken');


// =======================
// Verificar token
// =======================

//next lo que va a hacer es continuar con la ejecucion del programa 


let verificaToken = (req, res, next) => {
    //vamos a leer el header de la peticion
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            res.status(401).json({
                ok: false,
                err
            })
        }

        //decoded es el payload

        req.usuario = decoded.usuario;
        next(); //ojo debe ir dentro de esta funcion porque si va fuera, se ejecutaria el resto de codigo aunque el token sea invalido

    });


};

// =======================
// Verifica AdminRole
// =======================

let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE') {

        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });

    }

    next();
}




module.exports = {
    verificaToken,
    verificaAdminRole
}