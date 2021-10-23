/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); 					//Ensure our express framework has been added
var app = express();

const {pool} = require("./dbConfig");

var bodyParser = require('body-parser'); 			//Ensure our body-parser tool has been added
app.use(bodyParser.json());              			// support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const bcrypt = require("bcrypt"); //For encryption of passwords
const session = require('express-session'); 
const flash = require('express-flash');
const passport = require("passport"); //For verifying that a user is signed in before accessing various pages



app.set('view engine', 'ejs')


app.use(express.static(__dirname + '/'));


const initializePassport = require("./passportConfig");
initializePassport(passport);


app.use(session({
	secret: 'secret', //Simpler placeholder for now, but secret key to encrypt session info
	resave: false, 
	saveUninitialized: false //Don't save session information if no information has been entered
}));
app.use(flash()); //Display flash messages

app.use(express.urlencoded({extended: false})); //I do not know if this conflicts with the above, although it seems not to
app.use(passport.initialize());
app.use(passport.session());

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
	//console.log({username, userPassword, confPassword}); 
	let errors = []; //This is used for putting errors associated with registration on the page

	if(!username || !userPassword || !confPassword){
		errors.push({message: "Please enter all fields."});
	}

	if(userPassword.length < 5){
		errors.push({message: "Password must be at least 5 characters."});
	}

	if(userPassword != confPassword){
		errors.push({message: "Passwords do not match."});
	}

	if(errors.length > 0)	{
		res.render('pages/user_reg',{errors});
		} else {
			let hashedPassword = await bcrypt.hash(userPassword, 10); //Hashing passes
			//console.log({username, userPassword, hashedPassword});

			try {	
				pool.query( //This query is used for checking to make sure that the username doesn't already exist in the psql table
					`SELECT * FROM users WHERE username = $1;`, 
					[username],
					(err, results)=>{
						if(err){throw err;}
						//console.log("->Reaches Here<-");
						//console.log(results.rows);

						if(results.rows.length > 0){ //This means the query returned a match for the username
							errors.push({message: "Username already exists."});
							res.render('pages/user_reg', {errors});
						}else{
							pool.query(
								`INSERT INTO users (username, password)
								VALUES ($1, $2)
								RETURNING id, password`, [username, hashedPassword],
								(err, results) => {
									if (err){
										throw err;
									}
									console.log(results.rows);
									req.flash('success_msg', "You are now registered. Please login.");
									res.render('pages/user_login');
								}
							)
						}
					}
				);
			}
			catch (err){ //Just in case
				console.log("error");
				next(err);
			}
		}
});

app.post("/Login",passport.authenticate('local', {
	successRedirect: '/Account',
	failureRedirect: "/Login",
	failureFlash: true
}));

function checkAuthenticated(req,res,next){
	if (req.isAuthenticated()){
		return res.redirect('/Account');
	}
	next();
}

function checkNotAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/Login');
}

app.listen(3000);
console.log('3000 is the mAgIcAl PoRt~')