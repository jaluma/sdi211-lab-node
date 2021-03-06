module.exports = function (app, swig, usuariosService) {
    app.get("/usuarios", function (req, res) {
        res.send("ver usuarios");
    });

    app.get("/registrarse", function (req, res) {
        res.send(swig.renderFile('views/bregistro.html', {}));
    });

    app.get("/identificarse", function (req, res) {
        res.send(swig.renderFile('views/bidentificacion.html', {}));
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.send("Usuario desconectado");
    });

    app.post('/usuario', function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let usuario = {
            email: req.body.email,
            password: seguro
        };

        usuariosService.insertarUsuario(usuario, function (id) {
            if (id == null) {
                res.redirect("/registrarse?mensaje=Error al registrar usuario");
                return;
            }

            res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
        });
    });

    app.post("/identificarse", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        };
        usuariosService.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                req.session.usuario = null;
                res.redirect("/identificarse?mensaje=Email o password incorrecto&tipoMensaje=alert-danger");
                return;
            }

            req.session.usuario = usuarios[0].email;
            res.redirect("/publicaciones");
        });
    });
};
