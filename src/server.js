var express = require('express');			 			// A Node.js Framework
var app = express();									// Build app using express
var bodyParser = require('body-parser');			 	// A tool to help use parse the data in a post request
const session = require('express-session');				// TODO: Add comment
const flash = require('express-flash');					// TODO: Add comment
const bcrypt = require("bcrypt");						// For encryption of passwords
const passport = require("passport");					// For verifying
const initializePassport = require("./passportConfig");	// Load passport config
const {postgres} = require("./dbConfig");					// Load database config

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
	res.render('pages/home', {
		page_scripts: [],
		page_link_tags: [
			['stylesheet','../../resources/css/home.css']
		]
	});
});

app.get('/Documents', checkNotAuthenticated, function(req, res) {
	Promise.all([
		postgres.query(`
				SELECT documents.*
				FROM users
				RIGHT JOIN documents
				ON id=user_id
				WHERE username='${req.user.username}';`
			),
		postgres.query(`
				SELECT ARRAY_AGG(DISTINCT folder)
				FROM documents
				WHERE user_id=${req.user.id}`
			)
	])
	.then((batch) => {
		let file_system = {'root': {}}
		batch[1].rows[0].array_agg.forEach(folder => {
			folder = folder.split('/');
			let root = folder.shift();
			let current_directory = file_system[root]
			if (root !== 'root') throw new Error(folder + "is not organized under root!")
			else while (folder.length) {
				let subfolder = folder.shift();
				current_directory[subfolder] = {};
				current_directory = current_directory[subfolder];
			}
		});
		res.render('pages/user_docs', {
			page_scripts: [
				{src:'../../resources/js/docs.js'}
			],
			page_link_tags: [],
			user_docs: batch[0].rows,
			user_folders: file_system['root']
		})
	})
	.catch(error => {
		console.log(error.stack);
		res.render('pages/user_account_page', {
			user: 'AN ERROR HAS OCCURED',
			page_scripts: [],
			page_link_tags: []
		});
	});
});

app.get('/Editor', checkNotAuthenticated, function(req, res)  {
	res.render('pages/word_processor', {
		page_scripts: [ // Quill.js library
			{src:"https://cdn.quilljs.com/1.3.6/quill.js"},	
			{src:"../../resources/js/editor.js"},
			{	// Katex Library
				src:"https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.js",
				integrity:"sha384-GxNFqL3r9uRJQhR+47eDxuPoNE7yLftQM8LcxzgS4HT73tp970WS/wV5p8UzCOmb",
				crossorigin:"anonymous"
			}
		],
		page_link_tags: [
			{rel:'stylesheet', href:'https://cdn.quilljs.com/1.3.6/quill.snow.css'},
			{rel:'stylesheet', href:'../../resources/css/editor.css'},
			{rel:'preconnect', href:'https://fonts.googleapis.com'},
			{rel:'preconnect', href:'https://fonts.gstatic.com', crossorigin:true},
			{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Abel&family=Amatic+SC&family=Andada+Pro&family=Anton&family=Bebas+Neue&family=Birthstone&family=Caveat&family=Crimson+Text&family=Dancing+Script&display=swap'},
			{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Dosis&family=Ephesis&family=Explora&family=Festive&family=Gluten&family=Heebo&family=Henny+Penny&family=Inconsolata&family=Indie+Flower&family=Josefin+Sans&display=swap'},
			{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Karla&family=Karma&family=Lato&family=Long+Cang&family=Lora&family=Montserrat&family=Mukta&family=Noto+Sans&family=Oswald&family=Oxygen&family=Poppins&family=Quicksand&display=swap'},
			{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Roboto&family=Scheherazade&family=Shadows+Into+Light&family=Source+Code+Pro&family=Teko&family=Texturina&family=Ubuntu&family=Vollkorn&family=Work+Sans&family=Xanh+Mono&family=Yanone+Kaffeesatz&family=ZCOOL+KuaiLe&display=swap'}
		]
	});
});

app.get('/Generator', checkNotAuthenticated, function(req, res) {
	res.render('pages/prompt_generator', {
		page_scripts: [
			{src:'../../resources/js/bundle.js',type:'text/javascript'}
		],
		page_link_tags: [],
	});
});

app.get('/Register', checkAuthenticated, function(req, res) {
	res.render('pages/user_reg', {
		page_scripts: [],
		page_link_tags: []
	});
});

app.get('/Account', checkNotAuthenticated, function(req, res) {
	res.render('pages/user_account_page', {
		user: req.user.username,
		page_scripts: [],
		page_link_tags: []
	});
});

app.get('/Login', checkAuthenticated, function(req, res) {
	res.render('pages/user_login', {
		page_scripts: [],
		page_link_tags: []
	});
});

app.get('/Logout', (req,res)=> {
	req.logOut();
	req.flash('success_msg', "You have logged out.");
	res.redirect('/Login');
});

app.post('/Register', async (req, res)=>{
	let {username, userPassword, confPassword} = req.body; //get info from reg form
	let errors = []; //This is used for putting errors associated with registration on the page 
	if(!username || !userPassword || !confPassword)	errors.push({message: "Please enter all fields."});
	if(userPassword != confPassword)				errors.push({message: "Passwords do not match."});
	if(userPassword.length < 5) 					errors.push({message: "Password must be at least 5 characters."});
	
	if (!errors.length) {
		let hashedPassword = await bcrypt.hash(userPassword, 10); //Hashing passes

		//This query is used for checking to make sure that the username doesn't already exist in the psql table
		postgres	
			.query(`SELECT * FROM users WHERE username = ${username};`)
			.then((err, results) => {
				if (err) console.log(err);
				else if (results.rows.length) {	//This means the query returned a match for the username
					errors.push({message: "Username already exists."});
					res.render('pages/user_reg', {
						errors: errors,
						page_scripts: [],
						page_link_tags: []
					});
				}
				else postgres.query(`
						INSERT INTO users (username, password, created_on) 
						VALUES ($1, $2, $3)
						RETURNING id, password, created_on`,
						[username, hashedPassword, new Date()]
					)
					.then((err, results) => {
							if (err) throw err;
							else console.log(results.rows);
							req.flash('success_msg', "You are now registered. Please login.");
							res.render('pages/user_login', {
								page_scripts: [],
								page_link_tags: []
							});
						}
					)
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	}
	else res.render('pages/user_reg', {
		errors: errors,
		page_scripts: [],
		page_link_tags: []
	});
});

app.post("/Login",passport.authenticate('local', {
	successRedirect: '/Account',
	failureRedirect: "/Login",
	failureFlash: true
}));

function checkAuthenticated(req,res,next) {
	if (req.isAuthenticated()) return res.redirect('/Account');
	next();
}

function checkNotAuthenticated(req,res,next) {
	if(req.isAuthenticated()) return next();
	res.redirect('/Login');
}

app.listen(3000);
console.log('3000 is the mAgIcAl PoRt~')