module.exports = {
    repositorio: null,
    init: function (repositorio) {
        this.repositorio = repositorio;
    },
    insertarCancion: function (cancion, funcionCallback) {
        this.repositorio.insert('canciones', funcionCallback, cancion);
    },
    modificarCancion: function (criterio, cancion, funcionCallback) {
        this.repositorio.update('canciones', funcionCallback, criterio, cancion);
    },
    eliminarCancion: function (criterio, funcionCallback) {
        this.repositorio.delete('canciones', funcionCallback, criterio);
    },
    obtenerCanciones: function (criterio, funcionCallback) {
        this.repositorio.findAll('canciones', funcionCallback, criterio);
    },
    obtenerCancionesPg: function (criterio, pg, funcionCallback) {
        this.repositorio.findAllPage('canciones', funcionCallback, criterio, pg,);
    },
};
