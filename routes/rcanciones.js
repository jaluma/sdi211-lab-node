module.exports = function (app, swig, cancionesService) {

    app.get('/canciones/agregar', function (req, res) {
        res.send(swig.renderFile('views/bagregar.html', {}));
    });


    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = {"_id": cancionesService.repositorio.mongo.ObjectID(req.params.id)};
        cancionesService.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.redirect("/publicaciones");
                return;
            }

            let respuesta = swig.renderFile('views/bcancionModificar.html', {
                cancion: canciones[0]
            });
            res.send(respuesta);
        });
    });

    app.get('/cancion/:id', function (req, res) {
        const criterio = {"_id": cancionesService.repositorio.mongo.ObjectID(req.params.id)};
        cancionesService.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.redirect("/publicaciones");
                return;
            }

            let configuracion = {
                url: "https://api.exchangeratesapi.io/latest?base=EUR",
                method: "get",
                headers: {
                    "token": "ejemplo",
                }
            };
            let rest = app.get("rest");
            rest(configuracion, function (error, response, body) {
                console.log("cod: " + response.statusCode + " Cuerpo :" + body);
                let objetoRespuesta = JSON.parse(body);
                let cambioUSD = objetoRespuesta.rates.USD;

                // nuevo campo "usd"
                canciones[0].usd = cambioUSD * canciones[0].precio;
                canciones[0].usd = canciones[0].usd.toFixed(2);
                let respuesta = swig.renderFile('views/bcancion.html',
                    {
                        cancion: canciones[0]
                    });
                res.send(respuesta);
            });
        });
    });

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id": cancionesService.repositorio.mongo.ObjectID(req.params.id)};
        cancionesService.eliminarCancion(criterio, function (canciones) {
            if (canciones == null) {
                res.redirect("/publicaciones?mensaje=La canción no se ha podido eliminar&tipoMensaje=alert-danger");
                return;
            }

            res.redirect("/publicaciones");
        });
    });

    app.post("/cancion", function (req, res) {
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
            autor: req.session.usuario
        };
        // Conectarse
        cancionesService.insertarCancion(cancion, function (id) {
            if (id == null) {
                res.redirect("/publicaciones?mensaje=La canción no se ha podido insertar&tipoMensaje=alert-danger");
                return;
            }

            let imagen = req.files.portada;
            imagen.mv('public/portadas/' + id + '.png', function (err) {
                if (err) {
                    res.redirect("/publicaciones?mensaje=La canción no se ha podido insertar&tipoMensaje=alert-danger");
                    return;
                }

                let audio = req.files.audio;
                audio.mv('public/audios/' + id + '.mp3', function (err) {
                    if (err) {
                        res.redirect("/publicaciones?mensaje=La canción no se ha podido insertar&tipoMensaje=alert-danger");
                        return;
                    }

                    res.redirect("/publicaciones");
                });
            });
        });
    });

    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": cancionesService.repositorio.mongo.ObjectID(id)};

        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio
        };

        cancionesService.modificarCancion(criterio, cancion, function (result) {
            if (result == null) {
                res.redirect("/publicaciones?mensaje=La canción no se ha podido modificar&tipoMensaje=alert-danger");
                return;
            }

            paso1ModificarPortada(req.files, id, function (result) {
                if (result == null) {
                    res.redirect("/publicaciones?mensaje=La canción no se ha podido modificar&tipoMensaje=alert-danger");
                    return
                }

                res.redirect("/publicaciones");
            })
        });
    });

    app.get('/buscar', function (req, res) {
        res.redirect('/tienda?busqueda=' + req.query.busqueda);
    });

    app.get("/tienda", function (req, res) {
        let criterio = {};
        if (req.query.busqueda != null) {
            criterio = {"nombre": {$regex: ".*" + req.query.busqueda + ".*", $options: 'i'}};
        }
        let pg = parseInt(req.query.pg); // Es String !!!

        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }
        cancionesService.obtenerCancionesPg(criterio, pg, function (canciones) {
            if (canciones == null) {
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones: canciones,
                        paginas: [],
                        actual: pg
                    });
                res.send(respuesta);
                return;
            }

            cancionesService.totalCanciones(criterio, function (total) {
                if (total == null) {
                    return;
                }

                let ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimales
                    ultimaPg = ultimaPg + 1;
                }
                let paginas = []; // paginas mostrar
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones: canciones,
                        paginas: paginas,
                        actual: pg
                    });

                res.send(respuesta);
            });


        });
    });

    app.get("/publicaciones", function (req, res) {
        let criterio = {autor: req.session.usuario};
        cancionesService.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.redirect("/tienda");
                return;
            }
            let respuesta = swig.renderFile('views/bpublicaciones.html', {
                canciones: canciones
            });
            res.send(respuesta);
        });
    });

    /* AUXILIARES */

    function paso1ModificarPortada(files, id, callback) {
        if (files.portada != null) {
            let imagen = files.portada;
            imagen.mv('public/portadas/' + id + '.png', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    }

    function paso2ModificarAudio(files, id, callback) {
        if (files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/' + id + '.mp3', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    }
};
