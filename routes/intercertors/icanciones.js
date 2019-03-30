module.exports = {
    audios(app, express, cancionesService, comprasService) {
        let routerAudios = express.Router();
        routerAudios.use(function (req, res, next) {
            let path = require('path');
            let idCancion = path.basename(req.originalUrl, '.mp3');
            cancionesService.obtenerCanciones({id: cancionesService.repositorio.mongo.ObjectID(idCancion)}, function (canciones) {
                if (!canciones || canciones.length <= 0) {
                    res.redirect("/tienda");
                    return;
                }

                if (req.session.usuario && canciones[0].autor === req.session.usuario) {
                    next();
                    return;
                }

                let criterio = {
                    usuario: req.session.usuario,
                    cancionId: comprasService.repositorio.mongo.ObjectID(idCancion)
                };

                comprasService.obtenerCompras(criterio, function (compras) {
                    if (compras != null && compras.length > 0) {
                        next();
                        return;
                    }

                    res.redirect("/tienda");
                });
            })
        });

        app.use("/audios/", routerAudios);
    }
};
