// Módulos
const express = require('express');
const app = express();

const fs = require('fs');
const https = require('https');

const expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));
const crypto = require('crypto');

const fileUpload = require('express-fileupload');
app.use(fileUpload());
const mongo = require('mongodb');
const swig = require('swig');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const repositorio = require("./modules/repositorio");
const repo = new repositorio(app, mongo);
const cancionesService = require("./modules/services/cancionesService");
cancionesService.init(repo);
const usuariosService = require("./modules/services/usuariosService");
usuariosService.init(repo);
const comprasService = require("./modules/services/comprasService");
comprasService.init(repo);

// routerUsuarioSession
let routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) {
        next();
        return
    }

    console.log("va a : " + req.session.destino);
    res.redirect("/identificarse");
});

//Aplicar routerUsuarioSession
app.use("/canciones/agregar", routerUsuarioSession);
app.use("/publicaciones", routerUsuarioSession);
app.use("/cancion/comprar", routerUsuarioSession);
app.use("/compras", routerUsuarioSession);

//routerUsuarioAutor
let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function (req, res, next) {
    console.log("routerUsuarioAutor");
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
    cancionesService.obtenerCanciones({_id: mongo.ObjectID(id)}, function (canciones) {
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

//routerAudios
let routerAudios = express.Router();
routerAudios.use(function (req, res, next) {
    console.log("routerAudios");
    let path = require('path');
    let idCancion = path.basename(req.originalUrl, '.mp3');
    cancionesService.obtenerCanciones({id: mongo.ObjectID(idCancion)}, function (canciones) {
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
            cancionId: mongo.ObjectID(idCancion)
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

//Aplicar routerAudios
app.use("/audios/", routerAudios);

app.use(express.static('public'));
// Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:gwYPPrBJHvoB127i@tiendamusica-shard-00-00-cmjbg.mongodb.net:27017,tiendamusica-shard-00-01-cmjbg.mongodb.net:27017,tiendamusica-shard-00-02-cmjbg.mongodb.net:27017/test?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, usuariosService);
require("./routes/rcanciones.js")(app, swig, cancionesService);
require("./routes/rcompras.js")(app, swig, comprasService);

app.get('/', function (req, res) {
    res.redirect('/tienda');
});

// app.use(function (err, req, res) {
//     console.log("Error producido: " + err); //we log the error in our db
//     if (!res.headersSent) {
//         res.status(400);
//         res.send("Recurso no disponible");
//     }
// });

// lanzar el servidor
https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function () {
    console.log("Servidor activo");
});
