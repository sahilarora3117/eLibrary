var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var neo4j = require('neo4j-driver');
const request = require('request');

//Initialize express
var app = express();

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//body parser
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

const driver = neo4j.driver('bolt://hobby-mncpfljdcaibgbkeddooakel.dbs.graphenedb.com:24787', neo4j.auth.basic("sahilarora", "b.HDVy4n0lGO1f.dTprVVyO5PGk957T"), {
	encrypted: "ENCRYPTION_ON"
});
var session = driver.session();


//main page resnder path
app.get('/', function(req, res) {
	res.render('search');
	app.post('/result', function(req, res) {
		var query = req.body.query;
		console.log(query);

		var books = [];
		var quest = "CALL db.index.fulltext.queryNodes('bookssearch',"
		quest += "'" + query.trim() + "*');"

		session
			.run(quest)
			.then(function(result) {

				var bookArray = [];
				result.records.forEach(function(records) {
					bookArray.push({
						title: records._fields[0].properties.title,
						authors: records._fields[0].properties.authors,
						ISBN13: records._fields[0].properties.isbn13
					});

				});
				res.render('result', {
					books: bookArray,
					quest: quest
				});
			})
			.catch(function(err) {
				console.log("Error connecting to the server.Contact Administrator");
				res.render("index");
			});
		app.post('/Recommend', function(req, res) {
			var query = req.body.key;
			console.log("a" + query + "a");
			var quest = 'MATCH(b:Book{isbn13:"' + query.trim() + '"})<-[:GENRES]-(g:Dgenre)-[:GENRES]->(rb:Book)<-[:GENRES]-(g1:Dgenre)-[:GENRES]->(rb2:Book) return rb2 limit 5';
			session
				.run(quest)
				.then(function(result) {
					var bookArray = [];
					console.log(result.records);
					result.records.forEach(function(records) {
						console.log(records._fields[0].properties.title);
						bookArray.push({
							title: records._fields[0].properties.title,
							authors: records._fields[0].properties.authors,
							ISBN13: records._fields[0].properties.isbn13
						});

					});
					console.log(bookArray);
					res.render('recommend', {
						books: bookArray,
						query: query
					});
				})
				.catch(function(err) {
					console.log("Error connecting to the server.Contact Administrator");
					res.render("index");
				});

		});
		app.post('/fetchresult', function(req, res) {
			var query = req.body.query;
			console.log(query);
			var url = "https://openlibrary.org/api/books?bibkeys=ISBN:" + String(query) + "&format=json&jscmd=data";
			let options = {
				json: true
			};

			request(url, options, (error, ree, body) => {
				if (error) {
					return console.log(error)
				};

				if (!error && ree.statusCode == 200) {
					// do something with JSON, using the 'body' variable
				};
				var info = body["ISBN:" + String(query)];
				var bookArray = [];
				try {
					bookArray.push({
						title: info["title"],
						number_of_pages: info["number_of_pages"],
						by_statement: info["by_statement"],
						subjects: info["subjects"],
						url: info["url"],
						people: info["subject_people"],
						publish_date: info["publish_date"]
					});
					res.render('fetchresult', {
						books: bookArray
					});
				} catch {
					res.render('fetchresult', {
						books: bookArray
					});
				}

			});


		});
	});
});

//Fetch page render
app.get('/Fetch', function(req, res) {
	res.render('fetch');

	//Result from fetch
	app.post('/fetchresult', function(req, res) {
		var query = req.body.query;
		console.log(query);
		var url = "https://openlibrary.org/api/books?bibkeys=ISBN:" + String(query) + "&format=json&jscmd=data";
		let options = {
			json: true
		};

		request(url, options, (error, ree, body) => {
			if (error) {
				return console.log(error)
			};

			if (!error && ree.statusCode == 200) {
				// do something with JSON, using the 'body' variable
			};
			var info = body["ISBN:" + String(query)];
			var bookArray = [];
			try {
				bookArray.push({
					title: info["title"],
					number_of_pages: info["number_of_pages"],
					by_statement: info["by_statement"],
					subjects: info["subjects"],
					url: info["url"],
					people: info["subject_people"],
					publish_date: info["publish_date"]
				});
				res.render('fetchresult', {
					books: bookArray
				});
			} catch {
				res.render('fetchresult', {
					books: bookArray
				});
			}

		});


	});

});
//Genre Selection Page
app.get('/List', function (req,res){
  var query = "MATCH (n:Dgenre) RETURN n";
  session
			.run(query)
			.then(function(result) {

        var genreArray = [];
				result.records.forEach(function(records) {
          
					genreArray.push({
            genre: records._fields[0].properties.genre
          });
          
				});
				res.render('list', {
          books: genreArray
        });
			})
			.catch(function(err) {
				console.log("Error connecting to the server.Contact Administrator");
				res.render("index");
      });
    app.post('/listresult', function (req,res){
      var query = req.body.genre;
      console.log(quest);
      var quest = "MATCH (n:Dgenre{genre:'" +query.trim() + "'})-[r:GENRES]->(b:Book) RETURN b"
      session
			.run(quest)
			.then(function(result) {

        var bookArray = [];
				result.records.forEach(function(records) {
          bookArray.push({
            title: records._fields[0].properties.title,
            ISBN13: records._fields[0].properties.isbn13,
            authors: records._fields[0].properties.authors
          })
          
				});
				res.render('listresult', {
          books: bookArray
        });
			})
			.catch(function(err) {
				console.log("Error connecting to the server.Contact Administrator");
				res.render("index");
      });
	})
	app.post('/fetchresult', function(req, res) {
		var query = req.body.query;
		console.log(query);
		var url = "https://openlibrary.org/api/books?bibkeys=ISBN:" + String(query) + "&format=json&jscmd=data";
		let options = {
			json: true
		};

		request(url, options, (error, ree, body) => {
			if (error) {
				return console.log(error)
			};

			if (!error && ree.statusCode == 200) {
				// do something with JSON, using the 'body' variable
			};
			var info = body["ISBN:" + String(query)];
			var bookArray = [];
			try {
				bookArray.push({
					title: info["title"],
					number_of_pages: info["number_of_pages"],
					by_statement: info["by_statement"],
					subjects: info["subjects"],
					url: info["url"],
					people: info["subject_people"],
					publish_date: info["publish_date"]
				});
				res.render('fetchresult', {
					books: bookArray
				});
			} catch {
				res.render('fetchresult', {
					books: bookArray
				});
			}

		});


	});
	app.post('/Recommend', function(req, res) {
		var query = req.body.key;
		console.log("a" + query + "a");
		var quest = 'MATCH(b:Book{isbn13:"' + query.trim() + '"})<-[:GENRES]-(g:Dgenre)-[:GENRES]->(rb:Book)<-[:GENRES]-(g1:Dgenre)-[:GENRES]->(rb2:Book) return rb2 limit 5';
		session
			.run(quest)
			.then(function(result) {
				var bookArray = [];
				console.log(result.records);
				result.records.forEach(function(records) {
					console.log(records._fields[0].properties.title);
					bookArray.push({
						title: records._fields[0].properties.title,
						authors: records._fields[0].properties.authors,
						ISBN13: records._fields[0].properties.isbn13
					});

				});
				console.log(bookArray);
				res.render('recommend', {
					books: bookArray,
					query: query
				});
			})
			.catch(function(err) {
				console.log("Error connecting to the server.Contact Administrator");
				res.render("index");
			});

	});
});
app.listen(3000);
console.log('Server started');
module.exports = app;
