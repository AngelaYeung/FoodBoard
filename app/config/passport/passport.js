//load bcrypt
var bCrypt = require('bcrypt-nodejs');
const mysqlconnection = require('../../public/js/mysqlconnection');
var slacklog = require('../../public/js/slacklogs');

module.exports = function (passport, user) {

  var User = user;
  var LocalStrategy = require('passport-local').Strategy;
  passport.serializeUser(function (user, done) {
    done(null, user.userID);
  });
  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    User.findById(id).then(function (user) {
      if (user) {
        done(null, user.get());
      } else {
        done(user.errors, null);
      }
    });
  });
  passport.use('local-signup', new LocalStrategy({
      usernameField: 'register_email',
      passwordField: 'register_pwd',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    (req, register_email, register_pwd, done) => {
      var generateHash = (password) => {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
      };


      var userSelect = "SELECT userID FROM users WHERE email = ? LIMIT 1";

      mysqlconnection.pool.query(userSelect, [register_email], (error, results) => {
        if (error) {
          slacklog.log(`Event: Passport. ${userSelect}.`, error);
          console.log(new Date(Date.now()), 'Error:', error);

          return done(error);
        } else if (results.length) { // Return fail

          return done(null, false, console.log("Email is already taken."));
        } else {
          var userPassword = generateHash(register_pwd); // hashed password
          var data = {
            email: register_email,
            password: userPassword,
            firstName: req.body.register_first_name,
            lastName: req.body.register_last_name,
            suiteNumber: req.body.register_suite_number,
            role: 1
          };

          User.create(data).then((newUser, created) => {
            if (!newUser) {

              return done(null, false);
            }
            if (newUser) {

              return done(null, newUser);
            }
          });
        }
      });
    }
  ));

  //LOCAL SIGNIN
  passport.use('local-signin', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'login_email',
      passwordField: 'login_pwd',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    (req, login_email, login_pwd, done) => {

      var User = user;

      var isValidPassword = (userpass, password) => {
        return bCrypt.compareSync(password, userpass);
      }

      User.findOne({
        where: {
          email: login_email
        }
      }).then((user) => {

        if (!user) {
          return done(null, false, {
            message: 'Email does not exist.'
          });
        }

        if (!isValidPassword(user.password, login_pwd)) {
          // the call back function can send data back to auth.js
          return done(null, false, {
            message: 'Incorrect password.'
          });

        }


        var userinfo = user.get();

        return done(null, userinfo);

      }).catch((err) => {

        console.log("Error:", err);

        return done(null, false, {
          message: 'Something went wrong with your sign in.'
        });


      });

    }
  ));

}