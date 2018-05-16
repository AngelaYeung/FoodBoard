var authController = require('../controllers/authcontroller.js');
const mysqlconnection = require('../public/js/mysqlconnection.js');
var connection = mysqlconnection.handleDisconnect();

var validate = (app, passport) => {

    app.get('/signup', authController.signup);

    app.get('/signin', authController.signin);

    // Apple the local strategy to the registration route, re-directing to foodboard upon success and homepage if not.
    app.post('/user_registration', (req, res, next) => {
        passport.authenticate('local-signup', (err, user, info) => {
            if (err) { return next(err); }
            if (!user) {
                return res.render('home_wrong_registration', {
                    email: req.body.register_email,
                    first: req.body.register_first_name,
                    last: req.body.register_last_name,
                    suite: req.body.register_suite_number,
                });
            }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                insertSessionDB(req.sessionID, user.userID);
                return res.redirect('boardpage');
            });
        })(req, res, next);
    });

    app.get('/myposts', isLoggedIn, authController.myposts);

    app.get('/boardpage', isLoggedIn, authController.boardpage);

    app.get('/logout', authController.logout);

    app.post('/user_login', (req, res, next) => {
        passport.authenticate('local-signin', (err, user, info) => {
            if (err) { return next(err); }
            if (!user) {
                return res.render('home_wrong_pw', {
                    email: req.body.login_email
                });
            }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                insertSessionDB(req.sessionID, user.userID);
                return res.redirect('boardpage');
            });
        })(req, res, next);
    });


/*************************************************************************
 * 
 *         FOOD BOARD ACCOUNT SETTINGS FEATURE - SERVER SIDE
 * 
 * 
 *************************************************************************/
app.get('/account', isLoggedIn, (req, res) => {
    var sessionID = req.sessionID;
    var query = `SELECT * FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = '${sessionID}') LIMIT 1`;
    connection.query(query, (error, rows, fields) => {
      if (error) {
        console.log(error);
      } else {
  
        if (rows.length) {
          var userID = rows[0].Users_userID;
          //Query for user info for current user
          var userInfo = "SELECT * FROM users WHERE userID = ?";
          connection.query(userInfo, [userID], (error, result, field) => {
            if (error) {
              console.log("error");
            } else {
              console.log("successful");
              var name = result[0].firstName + " " + result[0].lastName;
              var email = result[0].email;
              var suiteNum = result[0].suiteNumber;
  
              res.render('account', {
                name: name,
                email: email,
                suiteNum: suiteNum,
              });
            }
          });
        }
      }
    });
  });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/signin');
    }

};

function insertSessionDB(sessionID, userID) {
    connection.query("INSERT INTO Sessions(sessionID, Users_userID) VALUES (?,?)", [sessionID, userID], (error, rows, fields) => {
        if (error) console.log(error);
        console.log(rows);
    });
};


module.exports = {
    validate: validate
};
