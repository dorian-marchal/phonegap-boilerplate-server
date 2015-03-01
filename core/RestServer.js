'use strict';

var RestServer = function() {

    this.config = require('../config');

    var restify = require('restify');
    this.router = restify.createServer();
    this.router.use(restify.bodyParser());
    this.router.use(restify.CORS());
    this.router.use(restify.fullResponse());

};

RestServer.prototype.start = function(onStart, onError) {

    var that = this;

    onStart = onStart || function() {};
    onError = onError || function() {};


    console.log('Database connection...');

    var mongoose = require('mongoose/');

    that.db = mongoose.connection;
    mongoose.connect(that.config.db.auth);

    that.db.on('error', onError);

    that.db.once('open', function () {

        console.log('Database connected !');
        onStart();

        var MyModelSchema = new mongoose.Schema({
            attribute: String,
            attribute2: Number,
            date: Date
        });

        mongoose.model('MyModel', MyModelSchema);
        var MyModel = mongoose.model('MyModel');

        function getMyModels(req, res) {

            MyModel
                .find()
                .sort({
                    date: 'desc'
                })
                .exec(function (err, data) {
                    if (err) {
                        return console.error(err);
                    }
                    res.send(data);
                })
            ;
        }

        function postMyModel(req, res) {

            var mymodel = new MyModel();

            if (req.params.attribute) {
                mymodel.attribute = req.params.attribute;
            }
            else {
                mymodel.attribute = 'default attribute';
            }

            if (req.params.attribute2) {
                mymodel.attribute2 = req.params.attribute2;
            }
            else {
                mymodel.attribute2 = -1;
            }

            mymodel.date = new Date();

            mymodel.save(function (err) {
                if (err) {
                    return console.error(err);
                }
                res.send(req.body);
            });
        }

        that.router.listen(that.config.port, function() {
            console.log('Server listening on port ' + that.config.port + '...');
        });
        // Set up our routes and start the server
        that.router.get('/mymodels', getMyModels);
        that.router.post('/mymodels', postMyModel);

    });
};

module.exports = new RestServer();
