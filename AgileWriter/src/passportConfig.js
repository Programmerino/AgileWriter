const LocalStrategy = require("passport-local").Strategy;
const postgres = require("./dbConfig");
const bcrypt = require("bcrypt");



function initialize(passport){
    const authenticateUser = (username, userPassword, done) =>{
        console.log("User <",username,"> is attempting to log in...");
        postgres.query(
            `SELECT * FROM users WHERE username = $1`,
            [username],
            (err, results)=>{
                if (err) console.log("login", err);
                else {
					console.log(results.rows); 
					if(results.rows.length > 0)
					{
						const user = results.rows[0];
						bcrypt.compare(userPassword, user.password, (err, isMatch) =>
						{
							if(err) console.log(err);
							else if(isMatch)
							{
								postgres.query(`UPDATE users SET last_login=$1 WHERE username=$2`, [new Date(), username])
								return done(null, user);
							}
							else return done(null, false, {message: "Password is not correct"});
							
						});
					}
					else{
						return done(null, false, {message: "Username does not exist"});
					}
				}
            }
        );
    };
    passport.use(
        new LocalStrategy({
            usernameField: "username",
            passwordField:  "userPassword"
        },
        authenticateUser
        )
    );

    passport.serializeUser((user,done)=> done(null, user.id));

    passport.deserializeUser((id, done)=>{
        postgres.query(
            `SELECT * FROM users WHERE id = $1`, [id], 
            (err, results)=>{
                if(err){
                    throw err
                }
                return done(null, results.rows[0]);
            }
        );
    });

	// try {
	// 	postgres.query(
	// 		`SELECT * FROM users WHERE username = $1 OR username = $2`,
	// 		['test', 'dummy'],
	// 		(err, results) => {
	// 			if (err) console.log("postgres:", err);
	// 			else if (results.rows.length > 0) {
	// 				bcrypt.hash("password", 10, (err, hash) => {
	// 					if (err) throw err;
	// 					postgres.query(
	// 						`UPDATE users SET password=$1 WHERE username = $2 OR username = $3`,
	// 						[hash, 'test', 'dummy'],
	// 						(err, results) => {if (err) throw err;}
	// 					)
	// 				});
	// 			}
	// 		}
	// 	)
	// }
	// catch(err) {console.log("ERROR:", err);;}
}
module.exports = initialize;