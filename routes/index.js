var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* service to check local db for result. */
router.post('/search', function(req, res, next) {
  // variable to keep post data
  var postData = req.body;

  // respond array to store status and result of db intraction
  var respond = {};
  respond['status'] = '0000';
  respond['data'] = {};

  req.database.connect(req.databaseUrl, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      respond['status'] = '0100';
    } else {
      console.log('Connection established to', req.databaseUrl);
      var collection = db.collection('translate');

      // query from db: check if FROM TEXT or TO TEXT are match with the FROM TEXT
      // and if it is, is the 'lang' attribute of the row contains both FROM LANG and TO LANG
      collection.find({ $or:[{from_text:postData.textFrom},{to_text:postData.textFrom}] , $and:[{lang:new RegExp(postData.from)},{lang: new RegExp(postData.to)}]}).limit(1).toArray(function (err, result) {
        if (err) {
          console.log(err);
          respond['status'] = '0010';
        } else if (result.length) {
          // storing the db values
          respond['status'] = '0000';
          respond['data']['from'] = result[0].from_lang;
          respond['data']['to'] = result[0].to_lang;
          respond['data']['lang'] = result[0].lang;
          respond['data']['textFrom'] = result[0].from_text;
          respond['data']['textTo'] = result[0].to_text;
        } else {
          respond['status'] = '0001';
          console.log('No document(s) found with defined "find" criteria!');
        }

        // sending data as json response
        res.send(JSON.stringify(respond));
        db.close();
      });
    }
  });

});

// service store data in local db
router.post('/store', function(req, res, next) {
  // variable to keep post data
  var postData = req.body;

  // respond array to store status and result of db intraction
  var respond = {};
  respond['status'] = '0000';

  req.database.connect(req.databaseUrl, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      respond['status'] = '0100';
    } else {
      console.log('Connection established to', req.databaseUrl);
      var collection = db.collection('translate');

      // query to insters fetched data to db
      collection.insert({ "from_lang" : postData.from, "to_lang": postData.to, "from_text" : postData.textFrom, "to_text" : postData.textTo, "lang" : postData.lang}, function (err, result) {
        if (err) {
          console.log(err);
          respond['status'] = '0010';
        } else {
          console.log('success');
          respond['status'] = '0000';
        }
        res.send(JSON.stringify(respond));
        db.close();
      });
    }
  });

});

module.exports = router;
