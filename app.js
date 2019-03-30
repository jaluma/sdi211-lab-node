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

// base de datos
const repositorio = require("./modules/repositorio");
const repo = new repositorio(app, mongo);

const cancionesService = require("./modules/services/cancionesService");
cancionesService.init(repo);

const usuariosService = require("./modules/services/usuariosService");
usuariosService.init(repo);

const comprasService = require("./modules/services/comprasService");
comprasService.init(repo);

// routerUsuarioSession
const iUsuario = require('./routes/intercertors/iusuarios');
iUsuario.usuario(app, express);

//routerUsuarioAutor
iUsuario.autor(app, express, cancionesService);

//routerAudios
const iCanciones = require('./routes/intercertors/icanciones');
iCanciones.audios(app, express, cancionesService, comprasService);

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

const rotros = require("./routes/rotros");
rotros.home(app);
rotros.error(app, swig);

// lanzar el servidor
https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function () {
    console.log("Servidor activo");
});
