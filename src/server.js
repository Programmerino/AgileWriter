var express = require('express');			 			// A Node.js Framework
var app = express();									// Build app using express
var bodyParser = require('body-parser');			 	// A tool to help use parse the data in a post request
const session = require('express-session');				// TODO: Add comment
const flash = require('express-flash');					// TODO: Add comment
const bcrypt = require("bcrypt");						// For encryption of passwords
const passport = require("passport");					// For verifying
const initializePassport = require("./passportConfig");	// Load passport config
const {pool} = require("./dbConfig");					// Load database config

initializePassport(passport);
app.use(bodyParser.json());              				// support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 	// support encoded bodies that a user is signed in before accessing various pages
app.set('view engine', 'ejs')							// enable usage of ejs format over html 
app.use(express.static(__dirname + '/'));				// set app directory
app.use(session({										// Initialize session module
	secret: 'cApItAlIsM$$$wIlL$$$bE$$$oUr$$$DoWnFaLl',	// Secret key to encrypt session info
	resave: false, 										// TODO: Add comment
	saveUninitialized: false 							// Don't save session information if no information has been entered
}));
app.use(flash()); 								// Display flash messages
app.use(express.urlencoded({extended: false}));	// I do not know if this conflicts with the above, although it seems not to
app.use(passport.initialize());					// Initialize passport module
app.use(passport.session());					// Link passport to session



app.get('/', function(req, res) {
	res.render('pages/home',{
		// pass variables to ejs here
	});
});

app.get('/Documents', checkNotAuthenticated, function(req, res) {
	res.render('pages/user_docs',{
		// pass variables to ejs here
	});
});

app.get('/Editor', checkNotAuthenticated, function(req, res) {
	res.render('pages/word_processor',{
		// pass variables to ejs here
	});
});

app.get('/Generator', checkNotAuthenticated, function(req, res) {
	res.render('pages/prompt_generator',{
		// pass variables to ejs here
	});
});

app.get('/Register', checkAuthenticated, function(req, res) {
	res.render('pages/user_reg',{
		// pass variables to ejs here
	});
});

app.get('/Account', checkNotAuthenticated, function(req, res) {
	res.render('pages/user_account_page',{
		// pass variables and stuff
		user: req.user.username
	});
});

app.get('/Login', checkAuthenticated, function(req, res) {
	res.render('pages/user_login',{
		// pass variables and stuff
	});
});

app.get('/Logout', (req,res)=>{
	req.logOut();
	req.flash('success_msg', "You have logged out.");
	res.redirect('/Login');
});

app.post('/Register', async (req, res)=>{
	let {username, userPassword, confPassword} = req.body; //get info from reg form
	let errors = []; //This is used for putting errors associated with registration on the page

	//console.log({username, userPassword, confPassword}); 
	if(!username || !userPassword || !confPassword)	errors.push({message: "Please enter all fields."});
	if(userPassword != confPassword)				errors.push({message: "Passwords do not match."});
	if(userPassword.length < 5) 					errors.push({message: "Password must be at least 5 characters."});
	
	if(errors.length == 0 )
	{
		let hashedPassword = await bcrypt.hash(userPassword, 10); //Hashing passes
		//console.log({username, userPassword, hashedPassword});

		try {	
			pool.query( //This query is used for checking to make sure that the username doesn't already exist in the psql table
				`SELECT * FROM users WHERE username = $1;`, [username], (err, results) => {
					if (err) throw err;
					else if (results.rows.length > 0)
					{	//This means the query returned a match for the username
						errors.push({message: "Username already exists."});
						res.render('pages/user_reg', {errors});
					}
					else {
						let created_on = new Date().toISOString().slice(0, 19).replace('T', ' ');
						pool.query(
							`INSERT INTO users (username, password, created_on) VALUES ($1, $2, $3) RETURNING id, password, created_on`,
							[username, hashedPassword, created_on], (err, results) => {
								if (err) throw err;
								else console.log(results.rows);
								req.flash('success_msg', "You are now registered. Please login.");
								res.render('pages/user_login');
							}
						);
					}
				}
			);
		}
		catch (err) { console.log("error"); next(err); }
	}
	else res.render('pages/user_reg',{errors});
});

app.post("/Login",passport.authenticate('local', {
	successRedirect: '/Account',
	failureRedirect: "/Login",
	failureFlash: true
}));

function checkAuthenticated(req,res,next){
	if (req.isAuthenticated()) return res.redirect('/Account');
	next();
}

function checkNotAuthenticated(req,res,next){
	if(req.isAuthenticated()) return next();
	res.redirect('/Login');
}

app.listen(3000);
console.log('3000 is the mAgIcAl PoRt~')