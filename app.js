var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var neo4j = require('neo4j-driver');
const request = require('request');

//Initialize express
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


//main page resnder path
app.get('/', function(req, res){
      res.render('index');
});

//most likely will never reach its initial commit
app.get('/Recommend', function(req, res){
  res.render('recommend');

});
//Search page render path
app.get('/Search', function(req, res){
  res.render('search');

  //result from search
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
      console.log("Error connecting to the server.Contact Administrator");
      res.render("index");
      });
  app.post('/Recommend', function(req,res){
    var query = req.body.key;
    console.log(query);
    
  });
});

});
//Fetch page render
app.get('/Fetch', function(req,res){
  res.render('fetch');
  
  //Result from fetch
app.post('/fetchresult', function(req,res){
  var query = req.body.query;
  console.log(query);
  var url = "https://openlibrary.org/api/books?bibkeys=ISBN:"+String(query)+"&format=json&jscmd=data";
  let options = {json: true};

  request(url, options, (error, ree, body) => {
      if (error) {
          return  console.log(error)
      };

      if (!error && ree.statusCode == 200) {
          // do something with JSON, using the 'body' variable
      };
      var info = body["ISBN:"+String(query)];
      var bookArray = [];
  try{
  bookArray.push({
    title:info["title"],
    number_of_pages:info["number_of_pages"],
    by_statement: info["by_statement"],
    subjects: info["subjects"],
    url: info["url"],
    people: info["subject_people"],
    publish_date: info["publish_date"]
  });
  res.render('fetchresult',{books: bookArray});
  }
  catch{
    res.render('fetchresult',{books: bookArray});
  }
 
  });
  
  
});

});
app.listen(3000);
console.log('Server started');
module.exports = app;