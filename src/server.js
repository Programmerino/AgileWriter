/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); 					//Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); 			//Ensure our body-parser tool has been added
app.use(bodyParser.json());              			// support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// var pgp = require ('pg-promise')();

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/'));

app.get('/', function(req, res) {
	res.render('pages/home',{
		// pass variables to ejs here
	});
});

app.get('/Documents', function(req, res) {
	res.render('pages/user_docs',{
		// pass variables to ejs here
	});
});

app.get('/Editor', function(req, res) {
	res.render('pages/word_processor',{
		// pass variables to ejs here
	});
});

app.get('/Generator', function(req, res) {
	res.render('pages/prompt_generator',{
		// pass variables to ejs here
	});
});

app.get('/Register', function(req, res) {
	res.render('pages/user_reg',{
		// pass variables to ejs here
	});
});

app.get('/Account', function(reg, res) {
	res.render('pages/user_account_page',{
		// pass variables and stuff
	});
});

app.get('/Login', function(reg, res) {
	res.render('pages/user_login',{
		// pass variables and stuff
	});
});


app.listen(3000);
console.log('3000 is the mAgIcAl PoRt~')