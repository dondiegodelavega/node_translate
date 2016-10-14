var supertest = require("supertest");
var config = require('config');

// setup supertest agent
var root = config.get('app.url.root');
var server = supertest.agent(root);

// routing unit test
describe("Routing unit test:",function(){

    it('GET / : should return 200', function(done){
        server
            .get('/')
            .expect(200)
            .end(function(err, res){
                if (err)
                    return done(err);
                done()
            });
    });

    it('GET /translate : should return 404', function(done){
        server
            .get('/translate')
            .expect(404)
            .end(function(err, res){
                if (err)
                    return done(err);
                done()
            });
    });

    it("GET /random : should return 404",function(done) {
        server
            .get("/random")
            .expect(404)
            .end(function (err, res) {
                if (err)
                    return done(err);
                done();
            });
    });
});

// Translate function unit test
describe("Translate service test: ",function() {
    // longer time out due to calling external api
    this.timeout(5000);

    it("Complete data, Should return 200", function (done) {
        var jsonData = {
            "langFrom": "en",
            "langTo": "fr",
            "textFrom": "hi",
            "textTo": ""
        };
        server
            .post("/translate")
            .send(jsonData)
            .expect(200)
            .end(function (err, res) {
                if (err)
                    return done(err);
                done();
            });
    });


    it("Incomplete data - no text , Should return 200", function (done) {
        var jsonData = {
            "langFrom": "en",
            "langTo": "fr"
        };
        server
            .post("/translate")
            .send(jsonData)
            .expect(200)
            .end(function (err, res) {
                if (err)
                    return done(err);
                done();
            });
    });

    it("Incomplete data - no language , Should return 200", function (done) {
        var jsonData = {
            "langFrom": "en",
            "textFrom": "hi",
            "textTo": ""
        };
        server
            .post("/translate")
            .send(jsonData)
            .expect(200)
            .end(function (err, res) {
                if (err)
                    return done(err);
                done();
            });
    });

    it("Empty post data, Should return 200", function (done) {
        var jsonData = "";
        server
            .post("/translate")
            .send(jsonData)
            .expect(200)
            .end(function (err, res) {
                if (err)
                    return done(err);
                done();
            });
    });

    it("special chars in post data, Should return 200", function (done) {
        var jsonData = "#@!&^%$";
        server
            .post("/translate")
            .send(jsonData)
            .expect(200)
            .end(function (err, res) {
                if (err)
                    return done(err);
                done();
            });
    });

    it("No post data, Should return 200", function (done) {
        server
            .post("/translate")
            .expect(200)
            .end(function (err, res) {
                if (err)
                    return done(err);
                done();
            });
    });
});
