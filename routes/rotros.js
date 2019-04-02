module.exports = {
    home: function (app) {
        app.get('/', function (req, res) {
            res.redirect('/tienda');
        });
    },
    error: function (app, swig) {
        app.use(require('express-domain-middleware'));

        let fn = function (err, req, res, next) {
            console.error(err.stack);
            if (!res.headersSent) {
                let respuesta = swig.renderFile('views/berror.html', {
                    status: err.status,
                    error: err.toString()
                });

                res.status(500).send(respuesta);
            }
        };

        app.use(fn);

        // app.get('*', function (req, res, next) {
        //     let err = new Error('Esta página no esta disponible');
        //     fn(err, req, res, next);
        // });
    }
};
