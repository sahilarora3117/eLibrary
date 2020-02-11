var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var neo4j = require('neo4j-driver');

var app = express ();

//View Engine
app.set ('views', path.join(__dirname, 'views'));
app.set ('view engine', 'ejs');

//body parser
app.use (logger('dev'));
app.use (bodyParser.json());
app.use (bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'neo'))
var session = driver.session();

app.get('/', function(req, res){
      res.render('index');
});
app.get('/Recommend', function(req, res){
  res.render('recommend');

});
app.get('/Search', function(req, res){
  res.render('search');


app.post('/result', function(req,res){
  var query = req.body.query;
  console.log(query);
  
  var books = [];
  var quest = "CALL db.index.fulltext.queryNodes('books',"
  quest +="'"+ query +"');"
  session
    .run (quest)
    .then(function(result){
      
      var bookArray = [];
      result.records.forEach(function(records){
        bookArray.push({title:records._fields[0].properties.title , 
                    authors: records._fields[0].properties.authors,
                    ISBN13: records._fields[0].properties.isbn13 });

      });
      res.render('result',{books: bookArray, quest: quest});
    })
    .catch(function(err){
      console.log(err)})
  
})

app.post('/description', function(req,res){
  var query = req.app.ISBN13;
  console.log(query);
});
});
app.listen(3000);
console.log('Server started');
module.exports = app;