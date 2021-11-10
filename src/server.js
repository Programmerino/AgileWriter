var express = require('express');			 			// A Node.js Framework
var app = express();									// Build app using express
var bodyParser = require('body-parser');			 	// A tool to help use parse the data in a post request
const session = require('express-session');				// TODO: Add comment
const flash = require('express-flash');					// TODO: Add comment
const bcrypt = require("bcrypt");						// For encryption of passwords
const passport = require("passport");					// For verifying
const initializePassport = require("./passportConfig");	// Load passport config
const {postgres} = require("./dbConfig");				// Load database config
const ROOT_DIR_NICKNAME = "My Documents";				// Determines nickname for root

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



app.get('/', checkNotAuthenticated, function(req, res) {
	res.render('pages/home', {
		page_scripts: [],
		page_link_tags: [
			['stylesheet','/resources/css/home.css']
		]
	});
});


app.get('/Documents*', checkNotAuthenticated, function(req, res) {
	let current = req.originalUrl.substring(1+req.originalUrl.lastIndexOf('/')).replace(/-/g,' ');
	let path = req.originalUrl.replace("/Documents","root").replace(/-/g,' ');
	let depth = (path.match(/\//g) || []).length + 1;
	

	Promise.all([
		postgres.query(`
			SELECT documents.*
			FROM users
			RIGHT JOIN documents
			ON id=user_id
			WHERE username='${req.user.username}'
			AND folder='${path}';
		`),
		postgres.query(`
			SELECT ARRAY_AGG(directory) AS root_directory
			FROM (
				SELECT directory
				FROM file_directory
				WHERE user_id=${req.user.id}
				GROUP BY directory
				ORDER BY directory
			) AS ordered_directory;
		`),
		postgres.query(`
			SELECT directory, collapsed
			FROM file_directory
			WHERE user_id=${req.user.id}
			ORDER BY directory;
		`),
		postgres.query(`
			SELECT user_id, directory
			FROM file_directory
			WHERE user_id=${req.user.id}
			AND hash_id='UNINITIALIZED';
		`)
	])
	.then((batch) => {
		let file_system = {}
		let file_system_state = {}
		file_system[ROOT_DIR_NICKNAME] = {}
		batch[1].rows[0].root_directory.forEach(folder => {
			folder = folder.split('/');
			let root = folder.shift();
			let current_directory = file_system[ROOT_DIR_NICKNAME]
			if (root !== 'root') throw new Error(folder + "is not organized under root!")
			else while (folder.length) {
				let subfolder = folder.shift();
				current_directory[subfolder] = {};
				current_directory = current_directory[subfolder];
			}
		});
		batch[2].rows.forEach(folder_path => {
			let valid_path = folder_path.directory.replace('root','').replace(/ /g,'-');
			file_system_state[valid_path] = folder_path.collapsed;
		});
		res.render('pages/user_docs', {
			page_scripts: [
				{src:'/resources/js/docs.js'}
			],
			page_link_tags: [
				{rel:'stylesheet', href:'/resources/css/user_docs.css'}
			],
			user_docs: batch[0].rows,
			user_folders: file_system,
			dir_state: file_system_state,
			dir_current: current,
			dir_path: path.replace('root','').replace(/ /g,'-'),
			dir_depth: depth
		})
		batch[3].rows.forEach(folder => {
			bcrypt
				.hash(folder.directory, 1)
				.then((hash, err) => {
					let replace_letter = String.fromCharCode(65+Math.floor(Math.random()*25.99))
					hash = hash.replace(/[\$\/\.\\\(\)]/g,replace_letter);
					postgres.query(`
					UPDATE file_directory
					SET hash_id='${hash}'
					WHERE user_id=${req.user.id}
					AND directory='${folder.directory}'
				`)})
				.catch(err => console.log(err));
		})
	})
	.catch(error => {
		console.log(error);
		res.render('pages/user_account_page', {
			user: 'AN ERROR HAS OCCURRED',
			page_scripts: [],
			page_link_tags: [],
			count_user_docs: 0,
			count_user_prompts: 0,
			count_user_words: 1337
		});
	});
});

app.post('/Documents/UpdateState', checkNotAuthenticated, function (req, res) {
	let directory = "root" + req.body.folder.replace(/-/g," ");
	postgres
		.query(`
			UPDATE file_directory
			SET collapsed = NOT collapsed
			WHERE directory='${directory}'
		`)
		.catch(err => console.log(err));
});

app.get('/Editor', checkNotAuthenticated, function(req, res) {
	res.render('pages/word_processor', {
		page_scripts: [ // Quill.js library
			{src:"https://cdn.quilljs.com/1.3.6/quill.js"},	
			{src:"/resources/js/editor.js"},
			{	// Katex Library
				src:"https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.js",
				integrity:"sha384-GxNFqL3r9uRJQhR+47eDxuPoNE7yLftQM8LcxzgS4HT73tp970WS/wV5p8UzCOmb",
				crossorigin:"anonymous"
			}
		],
		page_link_tags: [
			{rel:'stylesheet', href:'https://cdn.quilljs.com/1.3.6/quill.snow.css'},
			{rel:'stylesheet', href:'/resources/css/editor.css'},
			{rel:'preconnect', href:'https://fonts.googleapis.com'},
			{rel:'preconnect', href:'https://fonts.gstatic.com', crossorigin:true},
			{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Abel&family=Amatic+SC&family=Andada+Pro&family=Anton&family=Bebas+Neue&family=Birthstone&family=Caveat&family=Crimson+Text&family=Dancing+Script&display=swap'},
			{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Dosis&family=Ephesis&family=Explora&family=Festive&family=Gluten&family=Heebo&family=Henny+Penny&family=Inconsolata&family=Indie+Flower&family=Josefin+Sans&display=swap'},
			{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Karla&family=Karma&family=Lato&family=Long+Cang&family=Lora&family=Montserrat&family=Mukta&family=Noto+Sans&family=Oswald&family=Oxygen&family=Poppins&family=Quicksand&display=swap'},
			{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Roboto&family=Scheherazade&family=Shadows+Into+Light&family=Source+Code+Pro&family=Teko&family=Texturina&family=Ubuntu&family=Vollkorn&family=Work+Sans&family=Xanh+Mono&family=Yanone+Kaffeesatz&family=ZCOOL+KuaiLe&display=swap'}
		],
		document_delta: ''
	});
});

app.get('/Editor/:folder/:file', checkNotAuthenticated, function(req, res) {
	try {
		postgres.query(`
			SELECT directory
			FROM file_directory
			WHERE user_id=${req.user.id}
			AND hash_id='${req.params.folder}';
		`)
		.then((results, err) => {
			let fileDirec = results.rows[0].directory;
			let docTitleParsed = simpleParseSingleQuote(req.params.file);
			postgres.query(`
				SELECT delta
				FROM documents
				WHERE user_id=${req.user.id}
				AND folder='${results.rows[0].directory}'
				AND title='${docTitleParsed}';
			`)
			.then((results, err) => {
				res.render('pages/word_processor', {
					page_scripts: [ // Quill.js library
						{src:"https://cdn.quilljs.com/1.3.6/quill.js"},	
						{src:"/resources/js/editor.js"},
						{	// Katex Library
							src:"https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.js",
							integrity:"sha384-GxNFqL3r9uRJQhR+47eDxuPoNE7yLftQM8LcxzgS4HT73tp970WS/wV5p8UzCOmb",
							crossorigin:"anonymous"
						}
					],
					page_link_tags: [
						{rel:'stylesheet', href:'https://cdn.quilljs.com/1.3.6/quill.snow.css'},
						{rel:'stylesheet', href:'/resources/css/editor.css'},
						{rel:'preconnect', href:'https://fonts.googleapis.com'},
						{rel:'preconnect', href:'https://fonts.gstatic.com', crossorigin:true},
						{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Abel&family=Amatic+SC&family=Andada+Pro&family=Anton&family=Bebas+Neue&family=Birthstone&family=Caveat&family=Crimson+Text&family=Dancing+Script&display=swap'},
						{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Dosis&family=Ephesis&family=Explora&family=Festive&family=Gluten&family=Heebo&family=Henny+Penny&family=Inconsolata&family=Indie+Flower&family=Josefin+Sans&display=swap'},
						{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Karla&family=Karma&family=Lato&family=Long+Cang&family=Lora&family=Montserrat&family=Mukta&family=Noto+Sans&family=Oswald&family=Oxygen&family=Poppins&family=Quicksand&display=swap'},
						{rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Roboto&family=Scheherazade&family=Shadows+Into+Light&family=Source+Code+Pro&family=Teko&family=Texturina&family=Ubuntu&family=Vollkorn&family=Work+Sans&family=Xanh+Mono&family=Yanone+Kaffeesatz&family=ZCOOL+KuaiLe&display=swap'}
					],
					document_directory: fileDirec,
					document_title: req.params.file,
					document_delta: JSON.stringify(results.rows[0].delta)
				});
			})
		})
	}
	catch(error) {
		console.log(error);
		res.render('pages/user_account_page', {
			user: 'AN ERROR HAS OCCURRED',
			page_scripts: [],
			page_link_tags: [],
			count_user_docs: 0,
			count_user_prompts: 0,
			count_user_words: 1337
		});
	};
});

app.post('/Editor/LoadDocument', checkNotAuthenticated, function(req, res) {
	let delimiter = req.body.file.lastIndexOf('/');
	let path = req.body.file.substring(0,delimiter);
	let file = req.body.file.substring(delimiter+1);
	postgres.query(`
		SELECT hash_id
		FROM file_directory
		WHERE user_id=${req.user.id}
		AND directory='${path}';
	`)
	.then((results, err) => {
		let folder_id = results.rows[0].hash_id;
		res.redirect(`/Editor/${folder_id}/${file}`)
	})
});

function simpleParseSingleQuote(doc){
	var newDoc = "";
	let quoteCounter = [];
	for(let i = 0; i < doc.length; i++){
		if(doc[i] == "'"){
			newDoc += "'";
		}
		newDoc += doc[i];
	}
	return newDoc;
}

app.post('/Editor/SaveDocument', checkNotAuthenticated, (req,res)=>{
	let{documentContents, documentTitle, documentDirectory, savedDocBool} = req.body;
	documentTitle = simpleParseSingleQuote(documentTitle);
	documentContents = simpleParseSingleQuote(documentContents);
	//console.log(documentContents);
	documentContentsJSON = JSON.parse(documentContents);
	//console.log(documentTitle);
	//console.log(documentDirectory);

	if(savedDocBool == "true") //If we're purely trying to update a document
		{
			postgres.query(`SELECT * FROM documents WHERE title='${documentTitle}' AND user_id='${req.user.id}';`)
			.then((results,err) => {
				if(results.rows.length) { //If the user is editing a previously saved document
					postgres.query(`UPDATE documents SET delta = '${documentContents}'::jsonb
									WHERE title='${documentTitle}' AND user_id='${req.user.id}'`)
					.then((results,err)=>{
						res.redirect("/Documents");
					})
					
				}
			})
		}
	else { //If the user is creating and uploading a new document
		postgres.query(`SELECT * FROM documents WHERE strpos(title, '${documentTitle}') > 0 AND user_id='${req.user.id}';`)
		.then((results,err) => {
			if(results.rows.length) { //If the user is attempting to title a document the same as a previous document
				console.log(results.rows.length);
				updatedDocumentTitle = documentTitle + " (" + results.rows.length + ")"; //Does the conventional addition to same file name of adding (i) where i is index
				postgres.query(`INSERT INTO documents (user_id, folder, title, delta, created)
								SELECT id, folder, title, delta, created FROM users
								RIGHT JOIN (VALUES
									('${req.user.username}', '${updatedDocumentTitle}', 'root', '${documentContents}'::jsonb, NOW())
								) AS doc (owner, title, folder, delta, created)
								ON owner = username;`)
								.then((results,err)=>{
									res.redirect("/Documents");
								})
								.catch(err=>{
									throw err;
								})
				
			}else{ //If a user is inserting a brand new document
				postgres.query(`INSERT INTO documents (user_id, folder, title, delta, created)
								SELECT id, folder, title, delta, created FROM users
								RIGHT JOIN (VALUES
									('${req.user.username}', '${documentTitle}', 'root', '${documentContents}'::jsonb, NOW())
								) AS doc (owner, title, folder, delta, created)
								ON owner = username;`)
								.then((results,err)=>{
									res.redirect("/Documents");
								}) //For the insert statement I used what was similar to the create.sql
			}
		})
	}
});

app.get('/Generator', checkNotAuthenticated, function(req, res) {
	res.render('pages/prompt_generator', {
		page_scripts: [
			{src:'/resources/js/prompt_generator.js',type:'text/javascript'},
			{src:'/resources/js/bundle.js',type:'text/javascript'}
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
	postgres
		.query(`
			SELECT COUNT(*)
			FROM documents
			WHERE user_id=${req.user.id};
		`)
		.then((results, err) => {
			if (err) console.log(err)
			else res.render('pages/user_account_page', {
				user: req.user.username,
				page_scripts: [],
				page_link_tags: [],
				count_user_docs: results.rows[0].count,
				count_user_prompts: 0,
				count_user_words: 1337
			});
		})
		.catch(error => {
			console.log(error);
			res.render('pages/user_account_page', {
				user: 'AN ERROR HAS OCCURRED',
				page_scripts: [],
				page_link_tags: [],
				count_user_docs: 0,
				count_user_prompts: 0,
				count_user_words: 1337
			});
		});
});

app.get('/Login', checkAuthenticated, function(req, res) {
	res.render('pages/user_login', {
		page_scripts: [
			{src:"/resources/js/test_login.js"}
		],
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
	
	console.log(username);
	console.log(userPassword);

	if (!errors.length) {
		let hashedPassword = await bcrypt.hash(userPassword, 10); //Hashing passes
		console.log("HELLLLLO THEREEEEEEEEE1");
		//This query is used for checking to make sure that the username doesn't already exist in the psql table
		postgres.query(`SELECT * FROM users WHERE username='${username}';`)
			.then((results, err) => {
				if (err) console.log(err);
				if (results.rows.length) {	//This means the query returned a match for the username
					console.log("HELLLLLO THEREEEEEEEEE2");
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
							postgres.query(`
							INSERT INTO file_directory (user_id, directory)
							SELECT id, folder FROM users
							RIGHT JOIN (VALUES 
								('${username}', 'root'),
								('${username}', 'root/Personal')
							) AS dir (owner, folder)
							ON owner = username;`)
							.then((results,err)=>{
								console.log("HELLLLLO THEREEEEEEEEE3");
								if (err) throw err;
								else console.log(results.rows);
								req.flash('success_msg', "You are now registered. Please login.");
								res.render('pages/user_login', {
									page_scripts: [],
									page_link_tags: []
								});
							})
							
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

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
	console.log('${port}} ~♭♯iS tHe mAgIcAl PoRt~♩♬')
});