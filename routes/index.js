var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

// translate web service to handle transiting inputs
// parameters : 'langFrom', 'langTo', 'textFrom', 'textTo'
router.post('/translate', function(req, res, next) {
    var mongodb = require('mongodb');
    var config = require('config');
    var request = require('request');

    // variable to keep post data
    var postData = req.body;

    // respond array to store status and result of db interaction
    var respond = {};
    respond['status'] = '0000';
    respond['data'] = {};

    //connect to a mongodb server.
    var db = mongodb.MongoClient;
    // db url and auth connection string
    var dbUrl = config.get('app.database.connectionString');

    db.connect(dbUrl, function (err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
            respond['status'] = '0100';
        } else {

            console.log('Connection established to');
            var collection = db.collection('translate');

            // query from db: check if FROM TEXT or TO TEXT are match with the FROM TEXT
            // and if it is, is the 'lang' attribute of the row contains both FROM LANG and TO LANG
            var langToFrom = postData.langTo+"-"+postData.langFrom;
            var langFromTo = postData.langFrom+"-"+postData.langTo;
            collection.find(
                { $and:[{$or:[{text_from:postData.textFrom}, {text_to:postData.textFrom}]},
                    {$or:[{lang:langFromTo},{lang:langToFrom}]}]
                }).limit(1).toArray(function (err, result) {

                if (err) {
                    console.log(err);
                    respond['status'] = '0010';
                } else if (result.length) {
                    // storing the db values
                    respond['status'] = '0000';
                    respond['data']['langFrom'] = result[0].lang_from;
                    respond['data']['langTo'] = result[0].lang_to;
                    respond['data']['textFrom'] = result[0].text_from;
                    respond['data']['textTo'] = result[0].text_to;
                } else {
                    respond['status'] = '0001';
                    console.log('No document(s) found with defined "find" criteria!');
                }

                // if the data did not exist in db ot connection failed
                if(respond['status'] != "0000"){
                    var yendexUrl = config.get('app.url.yendex');
                    var yendexKey = config.get('app.key.yendex');
                    var apiUrl = yendexUrl+'?lang='+langFromTo+'&key='+yendexKey;

                    // make api call to yendex
                    request.post({url:apiUrl, form: {text:postData.textFrom}}, function(err,httpResponse,body){
                        if (err) {
                            console.log(err);
                            respond['status'] = '0020';
                            // sending data as json response
                            res.send(JSON.stringify(respond));
                            db.close();
                        }else{
                            var apiResponse = JSON.parse(body);
                            if(apiResponse.code == "200"){
                                respond['data']['langFrom'] = postData.langFrom;
                                respond['data']['langTo'] = postData.langTo;
                                respond['data']['textFrom'] = postData.textFrom;
                                respond['data']['textTo'] = apiResponse.text[0];

                                // db connected but no result was on local db
                                if(respond['status'] == "0001"){
                                    collection.insert({"lang_from" : postData.langFrom,
                                        "lang_to": postData.langTo,
                                        "text_from" : postData.textFrom,
                                        "text_to" : apiResponse.text[0],
                                        "lang" : langFromTo
                                    }, function (err, result) {
                                        if (err) {
                                            console.log('failed to save data in local db');
                                        } else {
                                            console.log('data saved in local db');
                                        }

                                        respond['status'] = '0000';
                                        res.send(JSON.stringify(respond));
                                        db.close();
                                    });
                                }else{ // if the local connection had problem

                                    respond['status'] = '0000';
                                    res.send(JSON.stringify(respond));
                                    db.close();
                                }
                            }else{
                                respond['status'] = '0200';
                                res.send(JSON.stringify(respond));
                                db.close();
                            }
                        }
                    });

                }else{ // data was returned from db
                    // sending data as json response
                    res.send(JSON.stringify(respond));
                    db.close();
                }
            });
        } // end of no error to connect to db
    });

});


module.exports = router;
