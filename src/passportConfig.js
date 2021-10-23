const LocalStrategy = require("passport-local").Strategy;
const {pool} = require("./dbConfig");
const bcrypt = require("bcrypt");



function initialize(passport){
    const authenticateUser = (username, userPassword, done) =>{
        console.log(username);
        pool.query(
            `SELECT * FROM users WHERE username = $1`,
            [username],
            (err, results)=>{
                if(err){
                    console.log(err);
                }
                console.log(results.rows);
                if(results.rows.length > 0){
                    const user = results.rows[0];

                    bcrypt.compare(userPassword, user.password, (err, isMatch)=>{
                        if(err){
                            console.log(err);
                        }
                        if(isMatch){
                            return done(null, user);
                        }else{
                            return done(null, false, {message: "Password is not correct"});
                        }
                    });
                }else{
                    return done(null, false, {message: "Username does not exist"});
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
        pool.query(
            `SELECT * FROM users WHERE id = $1`, [id], 
            (err, results)=>{
                if(err){
                    throw err
                }
                return done(null, results.rows[0]);
            }
        );
    });
}
module.exports = initialize;