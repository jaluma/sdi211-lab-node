module.exports = function (app, cancionesService, usuariosService) {

    app.get("/api/cancion", function (req, res) {
        cancionesService.obtenerCanciones({}, function (canciones) {
            let jsonFail = {
                error: "se ha producido un error"
            };
            let jsonSuccess = JSON.stringify(canciones);

            sendResponse(res, canciones == null, jsonFail, 500, jsonSuccess);
        });
    });

    app.delete("/api/cancion/:id", function (req, res) {
        const criterio = {"_id": cancionesService.repositorio.mongo.ObjectID(req.params.id)};

        cancionesService.eliminarCancion(criterio, function (canciones) {
            let jsonFail = {
                error: "se ha producido un error"
            };
            let jsonSuccess = JSON.stringify(canciones);

            sendResponse(res, canciones == null, jsonFail, 500, jsonSuccess);
        });
    });

    app.get("/api/cancion/:id", function (req, res) {
        const criterio = {"_id": cancionesService.repositorio.mongo.ObjectID(req.params.id)};

        cancionesService.obtenerCanciones(criterio, function (canciones) {
            let jsonFail = {
                error: "se ha producido un error"
            };
            let jsonSuccess = JSON.stringify(canciones[0]);

            sendResponse(res, canciones == null, jsonFail, 500, jsonSuccess);
        });
    });

    app.post("/api/cancion", function (req, res) {
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
        };

        // ¿Validar nombre, genero, precio?
        cancionesService.insertarCancion(cancion, function (id) {
            let jsonFail = {
                error: "se ha producido un error"
            };
            let jsonSuccess = {
                mensaje: "canción insertada",
                _id: id
            };

            sendResponse(res, id == null, jsonFail, 500, jsonSuccess, 201);
        });
    });

    app.put("/api/cancion/:id", function (req, res) {
        let criterio = {"_id": cancionesService.repositorio.mongo.ObjectID(req.params.id)};

        let cancion = {}; // Solo los atributos a modificar
        if (req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if (req.body.genero != null)
            cancion.genero = req.body.genero;
        if (req.body.precio != null)
            cancion.precio = req.body.precio;

        cancionesService.modificarCancion(criterio, cancion, function (result) {
            let jsonFail = {
                error: "se ha producido un error"
            };
            let jsonSuccess = {
                mensaje: "canción modificada",
                _id: req.params.id
            };

            sendResponse(res, result == null, jsonFail, 500, jsonSuccess);
        });
    });

    app.post("/api/autenticar/", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let criterio = {
            email: req.body.email,
            password: seguro
        };

        usuariosService.obtenerUsuarios(criterio, function (usuarios) {
            let jsonFail = {
                autenticado: false
            };

            let token = app.get('jwt').sign(
                {usuario: criterio.email, tiempo: Date.now() / 1000},
                "secreto");

            let jsonSuccess = {
                autenticado: true,
                token: token
            };

            sendResponse(res, usuarios == null || usuarios.length === 0, jsonFail, 401, jsonSuccess);
        });
    });

    function sendResponse(res, err, jsonfail, statusFail, jsonSuccess, statusSuccess = 200) {
        if (err) {
            send(res, statusFail, jsonfail);
            return;
        }

        send(res, statusSuccess, jsonSuccess);
    }

    function send(res, status, json) {
        res.status(status);
        res.json(json);
    }

};
