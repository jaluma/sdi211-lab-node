module.exports = function (app, swig, comprasService) {
    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = comprasService.repositorio.mongo.ObjectID(req.params.id);

        let compra = {
            usuario: req.session.usuario,
            cancionId: cancionId
        };
        comprasService.insertarCompra(compra, function (idCompra) {
            if (idCompra == null) {
                res.send(respuesta);
            } else {
                res.redirect("/compras");
            }
        });
    });

    app.get('/compras', function (req, res) {
        let criterio = {"usuario": req.session.usuario};
        comprasService.obtenerCompras(criterio, function (compras) {
            if (compras == null) {
                res.send("Error al listar ");
            } else {
                let cancionesCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    cancionesCompradasIds.push(compras[i].cancionId);
                }
                let criterio = {"_id": {$in: cancionesCompradasIds}};
                comprasService.obtenerCompras(criterio, function (canciones) {
                    let respuesta = swig.renderFile('views/bcompras.html', {
                        canciones: canciones
                    });
                    res.send(respuesta);
                });
            }
        });
    });
};
