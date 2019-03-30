module.exports = {
    init: function (repositorio) {
        this.repositorio = repositorio;
    },
    insertarCompra: function (compra, funcionCallback) {
        this.repositorio.insert('compras', funcionCallback, compra);
    },
    obtenerCompras: function (criterio, funcionCallback) {
        this.repositorio.findAll('compras', funcionCallback, criterio);
    },
};
