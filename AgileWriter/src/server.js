var express = require('express');			 			// A Node.js Framework
var app = express();									// Build app using express
var bodyParser = require('body-parser');			 	// A tool to help use parse the data in a post request
const session = require('express-session');				// TODO: Add comment
const flash = require('express-flash');					// TODO: Add comment
const bcrypt = require("bcrypt");						// For encryption of passwords
const passport = require("passport");					// For verifying
const initializePassport = require("./passportConfig");	// Load passport config
const postgres = require("./dbConfig");					// Load database config
const ROOT_DIR_NICKNAME = "My Documents";				// Determines nickname for root
// Get unique names!
const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');
var numDict = Array(990).fill().map((element,index) => (10+index).toString());
const ung_config = { // Initialize config for unique name gen
	dictionaries: [adjectives, animals, numDict],
	length: 3,
	separator: ' ',
	style: 'capital'
} 

initializePassport(passport);
app.use(bodyParser.json());              				// support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 	// support encoded bodies that a user is signed in before accessing various pages
app.set('view engine', 'ejs')							// enable usage of ejs format over html 
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/'));				// set app directory
app.use(session({										// Initialize session module
	secret: 'We_secretly_have_the_best_project_here',	// Secret key to encrypt session info
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
	let url = req.originalUrl;
	if (url[url.length-1] == '/') url = url.substring(0, url.length-1);
	let dir_current = url.substring(1 + url.lastIndexOf('/')).replace(/-/g,' ');
	let dir_path    = url.replace("/Documents","");
	let dir_depth   = (dir_path.match(/\//g) || []).length + 1;
	

	Promise.allSettled([
		postgres.query(`
			SELECT parent_id, folder_id, folder_name, title, collapsed
			FROM file_directory AS dir LEFT JOIN documents AS doc
			ON folder = folder_id AND dir.user_id = doc.user_id
			GROUP BY dir.user_id, parent_id, folder_id, folder_name, title, collapsed
			HAVING dir.user_id = ${req.user.id}
			ORDER BY parent_id,  folder_id, title DESC
		;`),
		postgres.query(`
			SELECT folder,
			ARRAY_AGG(title) AS files
			FROM (
				SELECT folder, title
				FROM documents
				WHERE user_id = ${req.user.id}
				ORDER BY folder, title
			) AS documents
			GROUP BY folder
			ORDER BY folder
		;`),
		postgres.query(`
			SELECT parent_id AS parent,
			ARRAY_AGG(folder_id) AS folders
			FROM (
				SELECT parent_id, folder_id
				FROM file_directory
				WHERE user_id = ${req.user.id}
				AND parent_id <> folder_id
				ORDER BY parent_id, folder_id
			) as directory
			GROUP BY parent
		;`)
	])
	.then(batch => {
		let directory 		  = batch[0].value.rows;
		let current_files 	  = batch[1].value.rows;
		let current_folders   = batch[2].value.rows;
		let root_is_collapsed = batch[0].value.rows.shift().collapsed

		let map_path = {};
		let map_state = {};
		let map_parent = {};
		let root_directory = {};
		let ordered_directory = {};

		ordered_directory[0] = {};
		map_parent[0] = 0;
		map_path[0] = '';
		map_path[map_path[0]] = 0;
		map_state[0] = root_is_collapsed;
		
		// Child folders cannot be initialized before parent folders.
		// The following for loop ensures they're visited in the correct order.
		let i = 0;
		let visit_order = [];
		let found_set = {};
		let stray_set = {};
		let stray_index = {};
		found_set[0] = true;

		directory.forEach(folder => {
			ordered_directory[folder.folder_id] = {}
			if (found_set[folder.parent_id]) {
				visit_order.push(i++);
				if (!found_set[folder.folder_id]) {
					found_set[folder.folder_id] = true;
					Object.keys(stray_set).forEach(stray_id => {
						if (stray_set[stray_id] == folder.folder_id) {
							found_set[stray_id] = true;
							visit_order.push(stray_index[stray_id]);
							delete stray_set[stray_id];	
						}
					});
				}
			} else  {
				stray_set[folder.folder_id] = folder.parent_id;
				stray_index[folder.folder_id] = i++;
			}
		});

		visit_order.forEach(index => {
			let folder = directory[index];
			if (folder.folder_id != folder.parent_id)
			{
				ordered_directory[folder.parent_id][folder.folder_name] = ordered_directory[folder.folder_id];
				map_path[folder.folder_id] = map_path[folder.parent_id] + '/' + folder.folder_name.replace(/ /g,'-');
				map_path[map_path[folder.folder_id]] = folder.folder_id;
				map_state[folder.folder_id] = folder.collapsed;
				map_parent[folder.folder_id] = folder.parent_id;
			}
		});

		let dir_files, dir_folders, next_dir;
		let dir_id = map_path[dir_path];
		root_directory[ROOT_DIR_NICKNAME] = ordered_directory[0];
		
		while (!dir_files && (next_dir = current_files.shift()))
			if (dir_id == next_dir.folder)
				dir_files = next_dir;

		while (!dir_folders && (next_dir = current_folders.shift()))
			if (dir_id == next_dir.parent)
				dir_folders = next_dir
		
		if (!dir_files)   dir_files   = {folder:-1, files:  []};
		if (!dir_folders) dir_folders = {parent:-1, folders:[]};
		
		res.render('pages/user_docs', {
			page_scripts: [
				{src:'/resources/js/docs.js'}
			],
			page_link_tags: [
				{rel:'stylesheet', href:'/resources/css/user_docs.css'}
			],
			user_folders: 	root_directory,
			map_path: 		map_path,
			map_state: 		map_state,
			map_parent: 	map_parent,
			dir_current: 	dir_current,
			dir_id:			dir_id,
			dir_path: 		dir_path,
			dir_depth: 		dir_depth,
			dir_files: 		dir_files,
			dir_folders: 	dir_folders,
			root_nickname: 	ROOT_DIR_NICKNAME
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

app.post('/DocumentBrowser/UpdateState', checkNotAuthenticated, function (req, res) {
	postgres
		.query(`
			UPDATE file_directory
			SET collapsed = NOT collapsed
			WHERE user_id = ${req.user.id}
			AND folder_id = ${req.body.folder}
		`)
		.then((results,err) => {
			res.send({success:"Updated Successfully", status: 200});
		})
		.catch(err => console.log(err));
});

app.post('/DocumentBrowser/RenameFolder', checkNotAuthenticated, function (req, res)  {
	postgres
		.query(`
			UPDATE file_directory
			SET folder_name = '${req.body.new_name}'
			WHERE user_id = ${req.user.id}
			AND folder_id = ${req.body.folder}
		;`)
		.then((results,err) => {
			res.send({success:"Updated Successfully", status: 200});
		})
		.catch(err => {
			console.log(err)
			res.send({failed:"Could not Update...", status: 409});
		});
});

app.post('/DocumentBrowser/RenameFile', checkNotAuthenticated, function (req, res) {
	postgres
		.query(`
			UPDATE documents
			SET title = '${req.body.new_name}'
			WHERE title = '${req.body.old_name}'
			AND user_id = ${req.user.id}
			AND folder  = ${req.body.folder}
		;`)
		.then((results,err) => {
			res.send({success:"Updated Successfully", status: 200});
		})
		.catch(err => {
			console.log(err)
			res.send({failed:"Could not Update...", status: 409});
		});
});

app.post('/MoveItem', checkNotAuthenticated, function(req, res) {
	if (req.body.type === 'folder') {
		postgres.query(`
			UPDATE file_directory
			SET parent_id = ${req.body.destination}
			WHERE user_id = ${req.user.id}
			AND folder_id = ${req.body.source}
		;`)
		.then((results,err) => {
			res.send({success:"Updated Successfully", status: 200});
		})
		.catch(err => {
			console.log(err)
			res.send({failed:"Could not Update...", status: 409});
		});
	} else {
		let source     = req.body.source;
		let delimiter  = source.search("/");
		let src_folder = source.substring(0,  delimiter);
		let src_file   = source.substring(1 + delimiter);
		postgres.query(`
			UPDATE documents
			SET folder = ${req.body.destination}
			WHERE user_id = ${req.user.id}
			AND folder = ${src_folder}
			AND title = '${src_file}'
		;`)
		.then((results,err) => {
			res.send({success:"Deleted Successfully", status: 200});
		})
		.catch(err => {
			console.log(err)
			res.send({failed:"Could not Update...", status: 409});
		});
	}
});

app.post('/DeleteItem', checkNotAuthenticated, function(req, res) {
	if (req.body.type === 'folder') {
		postgres.query(`
			DELETE FROM file_directory
			WHERE user_id = ${req.user.id}
			AND (folder_id = ${req.body.source}
			OR parent_id = ${req.body.source})
		;`)
		.then((results,err) => {
			res.send({success:"Updated Successfully", status: 200});
		})
		.catch(err => {
			console.log(err)
			res.send({failed:"Could not Update...", status: 409});
		});
	} else {
		let source     = req.body.source;
		let delimiter  = source.search("/");
		let src_folder = source.substring(0,  delimiter);
		let src_file   = source.substring(1 + delimiter);
		postgres.query(`
			DELETE FROM documents
			WHERE user_id = ${req.user.id}
			AND folder = ${src_folder}
			AND title = '${src_file}'
		;`)
		.then((results,err) => {
			res.send({success:"Deleted Successfully", status: 200});
		})
		.catch(err => {
			console.log(err)
			res.send({failed:"Could not Update...", status: 409});
		});
	}
});

app.post('/NewFolder', checkNotAuthenticated, function(req, res) {
	let unique_name = uniqueNamesGenerator(ung_config)
	postgres
		.query(`
			INSERT INTO file_directory (user_id, parent_id, folder_id, folder_name)
			SELECT user_id, parent_id, free_id, folder_name FROM (
				SELECT t1.user_id, t1.folder_id+1 AS free_id
				FROM file_directory AS t1
				LEFT JOIN file_directory AS t2
				ON t1.folder_id = t2.folder_id -1
				AND t1.user_id = t2.user_id
				WHERE t2.folder_id IS NULL
				AND t1.user_id = ${req.user.id}
				ORDER BY t1.folder_id
				LIMIT 1
			) AS next_free_id,
			(VALUES(${req.body.parent}, '${unique_name}')) AS new_folder(parent_id, folder_name)
			RETURNING folder_id
		;`)
		.then((results, err) => {	
			res.send({name: unique_name, id: results.rows[0].folder_id})
		});
});


app.get('/Editor', checkNotAuthenticated, function(req, res) {
	postgres.query(`SELECT folder_name FROM file_directory
	WHERE user_id='${req.user.id}' ORDER BY folder_id;`)
	.then((results,err)=>{
		let userDirecs = [];
			for(var i = 0; i < results.rows.length; i++){
				userDirecs[i] = results.rows[i].folder_name;
			}
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
			user_directories: userDirecs,
			document_delta: '',
            document_created: new Date()
		});
	})
	
});

app.get('/Editor/:folder/:file', checkNotAuthenticated, function(req, res) {
	let folder_id = req.params.folder.replace(/%20/g,' ');
	let file = req.params.file;
	let directory = [];
	let current_dir = '';
	Promise.allSettled([
		postgres.query(`
			SELECT delta, created
			FROM documents
			WHERE user_id=${req.user.id}
			AND folder='${folder_id}'
			AND title='${file}';
		`),
		postgres.query(`
			SELECT folder_name FROM file_directory
			WHERE user_id='${req.user.id}'
		;`)
	])
	.then((batch, err)=>{
		let docDelta = JSON.stringify(batch[0].value.rows[0].delta);
		folder_count = batch[1].value.rows.length - 1;
		for(var i = 0; i < batch[1].value.rows.length; i++){
			directory[folder_count] = batch[1].value.rows[i].folder_name;
			folder_count--;
		} //Done a bit oddly to get the folder names into the same order as their id's
		current_dir = directory[folder_id];
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
			document_directory: current_dir,
			user_directories: directory,
			document_title: file.replace(/-/g,' '),
			document_delta: docDelta,
			document_created: batch[0].value.rows[0].created
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

app.post('/LoadDocument', checkNotAuthenticated, function(req, res) {
	let delimiter = req.body.file.lastIndexOf('/');
	let folder_id = req.body.file.substring(0,delimiter);
	let file = req.body.file.substring(delimiter+1);
	res.redirect(`/Editor/${folder_id}/${file}`)
});

app.post('/SaveDocument', checkNotAuthenticated, (req,res)=>{
	let{documentContents, documentTitle, documentDirectory, currentDirectoryID, savedDocBool} = req.body;
	documentTitle = simpleParseSingleQuote(documentTitle.trim());
	documentContents = simpleParseSingleQuote(documentContents);
	documentContentsJSON = JSON.parse(documentContents);
	
	// If the document does not have a name, it will be untitled
	if (documentTitle.length == 0) documentTitle = "Untitled";

	if(savedDocBool == "true") //If we're purely trying to update a document
		{
			postgres.query(`
				SELECT * 
				FROM documents
				WHERE title='${documentTitle}'
				AND user_id='${req.user.id}'
				AND folder = ${currentDirectoryID}
			;`)
			.then((results,err) => {
				if(results.rows.length) { //If the user is editing a previously saved document
					postgres.query(`
						UPDATE documents
						SET delta = '${documentContents}'::jsonb
						WHERE title='${documentTitle}'
						AND user_id='${req.user.id}'
						AND folder = ${currentDirectoryID}
					;`)
					.then((results,err)=>{
						res.redirect("/Documents");
					})
					
				}
			})
		}
	else postgres.query(`
		SELECT * 
		FROM documents 
		WHERE STRPOS(title, '${documentTitle}') > 0 
		AND user_id='${req.user.id}'
		AND folder = ${documentDirectory}
	;`)
	.then((results,err) => {
		if(results.rows.length) { 
			// If the user is attempting to title a document the same as a previous document
			updatedDocumentTitle = documentTitle + " (" + results.rows.length + ")";
			//Does the conventional addition to same file name of adding (i) where i is index
			postgres.query(`
				INSERT INTO documents (user_id, folder, title, delta, created)
				SELECT id, folder, title, delta, created
				FROM users RIGHT JOIN (VALUES
					('${req.user.username}', '${updatedDocumentTitle}', ${documentDirectory}, '${documentContents}'::jsonb, NOW())
				) AS doc (owner, title, folder, delta, created)
				ON owner = username
			;`)
			.then((results,err)=>{
				res.redirect("/Documents");
			})
			.catch(err=>{
				throw err;
			});
			
		}else{ //If a user is inserting a brand new document
			//documentDirectory = parseInt(documentDirectory);
			postgres.query(`
				INSERT INTO documents (user_id, folder, title, delta, created)
				SELECT id, folder, title, delta, created 
				FROM users RIGHT JOIN (VALUES
					('${req.user.username}', '${documentTitle}', '${documentDirectory}'::integer, '${documentContents}'::jsonb, NOW())
				) AS doc (owner, title, folder, delta, created)
				ON owner = username
			;`)
			.then((results,err)=>{
				res.redirect("/Documents");
			}) //For the insert statement I used what was similar to the create.sql
		}
	})
});

app.get('/Generator', checkNotAuthenticated, function(req, res) {
	postgres
        .query(`
            SELECT initialText, Prompt
            FROM savedPrompts
            WHERE user_id = ${req.user.id}
        ;`)
        .then((results, err) => {
            
            res.render('pages/prompt_generator', {
                page_scripts: [
                    {src:'/resources/js/prompt_generator.js',type:'text/javascript'},
                    {src:'/resources/js/bundle.js',type:'text/javascript'}
                ],
                page_link_tags: [],
                prompts: results.rows,
            });
        })
        .catch(error => console.log(error));
});

app.post('/savePrompts', checkNotAuthenticated, function(req,res) {
	postgres.query(`INSERT INTO savedPrompts(id, initialText, Prompt)
					VALUES (${req.user.id}, \`${req.body.initText}\`, '${req.body.prompt}');`)
	.catch(error => console.log(error));
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
							
							INSERT INTO file_directory (user_id, parent_id, folder_id, folder_name)
							SELECT id, parent_id, folder_id, folder_name FROM users
							RIGHT JOIN (
							VALUES
								('${username}',0,  0, 'root'),
								('${username}',  0,  1, 'Personal')
							) AS dir (owner, parent_id, folder_id, folder_name)
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

const server = app.listen(process.env.PORT || 3000, () => {
	console.log('${port}} ...is tHe mAgIcAl PoRt~   ☆ ★ ☆ ★ ☆ ★   ~tRoP lAcIgAm eHt si...')
});