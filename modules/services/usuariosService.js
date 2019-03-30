module.exports = {
    init: function (repositorio) {
        this.repositorio = repositorio;
    },
    insertarUsuario: function (usuario, funcionCallback) {
        this.repositorio.insert('usuarios', funcionCallback, usuario);
    },
    obtenerUsuarios: function (criterio, funcionCallback) {
        this.repositorio.findAll('usuarios', funcionCallback, criterio);
    },
};
