module.exports = {
    usuario(app, express) {
        let routerUsuarioSession = express.Router();
        routerUsuarioSession.use(function (req, res, next) {
            if (req.session.usuario) {
                next();
                return
            }

            res.redirect("/identificarse");
        });

        app.use("/canciones/agregar", routerUsuarioSession);
        app.use("/publicaciones", routerUsuarioSession);
        app.use("/cancion/comprar", routerUsuarioSession);
        app.use("/compras", routerUsuarioSession);
    },
    autor(app, express, cancionesService) {
        let routerUsuarioAutor = express.Router();
        routerUsuarioAutor.use(function (req, res, next) {
            let path = require('path');
            let id = path.basename(req.originalUrl);
            if (id.length < 12 || id.length > 24) {
                res.redirect("/publicaciones?mensaje=La canción no se ha podido modificar porque no existia&tipoMensaje=alert-danger");
                return;
            }

            if (req.session.usuario === null) {
                res.redirect("/identificarse");
                return;
            }

            // Cuidado porque req.params no funciona
            // en el router si los params van en la URL.
            cancionesService.obtenerCanciones({_id: cancionesService.repositorio.mongo.ObjectID(id)}, function (canciones) {
                if (canciones === null || canciones.length === 0 || canciones[0].autor !== req.session.usuario) {
                    res.redirect("/tienda");
                    return;
                }
                next();
            })
        });

        //Aplicar routerUsuarioAutor
        app.use("/cancion/modificar", routerUsuarioAutor);
        app.use("/cancion/eliminar", routerUsuarioAutor);
    }
};
