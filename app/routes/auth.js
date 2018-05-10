var mysql = require('mysql');

var authController = require('../controllers/authcontroller.js');
var dbconfig = require('../public/js/dbconfig.js');
var connection = mysql.createConnection(dbconfig);

var validate = (app, passport) => {

    app.get('/signup', authController.signup);

    app.get('/signin', authController.signin);

    // Apple the local strategy to the registration route, re-directing to foodboard upon success and homepage if not.
    app.post('/user_registration', (req, res, next) => {
        passport.authenticate('local-signup', (err, user, info) => {
            if (err) { return next(err); }
            if (!user) {
                console.log('Err: ', err);
                console.log('Info: ', info);
                console.log('User: ', user);
                return res.render('home_wrong_registration', {
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



    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/signin');
    }

};

function insertSessionDB(sessionID, userID) {
    connection.query("INSERT INTO sessions(sessionID, Users_userID) VALUES (?,?)", [sessionID, userID], (error, rows, fields) => {
        if (error) console.log(error);
        console.log(rows);
    });
};

module.exports = {
    validate: validate
};




