module.exports = class Repositorio {
    constructor(app, mongo) {
        this.app = app;
        this.mongo = mongo;
        this.page = 4;
    }

    static callback(err, result, funcionCallback) {
        funcionCallback(err ? null : result);
    }

    insert(collection, funcionCallback, item) {
        this.connection(funcionCallback, (db) => {
            db.collection(collection).insert(item, (err, result) => {
                Repositorio.callback(err, result.ops[0]._id, funcionCallback);
            });
        });
    }

    update(collection, funcionCallback, criterio, item) {
        this.connection(funcionCallback, (db) => {
            db.collection(collection).update(criterio, {$set: item}, (err, result) => {
                Repositorio.callback(err, result, funcionCallback);
            });
        });
    }

    delete(collection, funcionCallback, criterio) {
        this.connection(funcionCallback, (db) => {
            db.collection(collection).remove(criterio, (err, result) => {
                Repositorio.callback(err, result, funcionCallback);
            });
        });
    }

    findAll(collection, funcionCallback, criterio) {
        this.connection(funcionCallback, (db) => {
            db.collection(collection).find(criterio).toArray((err, result) => {
                Repositorio.callback(err, result, funcionCallback);
            });
        });
    }

    findAllPage(collection, funcionCallback, criterio, pg) {
        this.connection(funcionCallback, (db) => {
            db.collection(collection).find(criterio).skip((pg - 1) * 4).limit(this.page).toArray((err, result) => {
                Repositorio.callback(err, result, funcionCallback);
            });
        });
    }

    countItems(collection, funcionCallback, criterio) {
        this.connection(() => {
        }, (db) => {
            db.collection(collection).count(criterio, (err, numItems) => {
                Repositorio.callback(err, numItems, funcionCallback);
            });
        });
    }

    connection(funcionCallback, funcionExito) {
        this.mongo.MongoClient.connect(this.app.get('db'), (err, db) => {
            if (err) {
                funcionCallback(null);
                return;
            }

            funcionExito(db);
        });
    }

};

