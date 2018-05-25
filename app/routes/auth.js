var authController = require('../controllers/authcontroller.js');
const mysqlconnection = require('../public/js/mysqlconnection.js');

var validate = (app, passport) => {

  app.get('/signup', authController.signup);

  app.get('/signin', authController.signin);

  // Apply the local strategy to the registration route, re-directing to foodboard upon success and homepage if not.
  app.post('/user_registration', (req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.render('home_wrong_registration', {
          email: req.body.register_email,
          first: req.body.register_first_name,
          last: req.body.register_last_name,
          suite: req.body.register_suite_number,
        });
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        insertSessionDB(req.sessionID, user.userID);
        return res.redirect('boardpage');
      });
    })(req, res, next);
  });
  app.get('/account', isLoggedIn, authController.account);

  app.get('/myposts', isLoggedIn, authController.myposts);

  app.get('/myclaims', isLoggedIn, authController.myclaims);

  app.get('/boardpage', isLoggedIn, authController.boardpage);

  app.get('/logout', authController.logout);

  app.post('/user_login', (req, res, next) => {
    passport.authenticate('local-signin', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.render('home_wrong_pw', {
          email: req.body.login_email
        });
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
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

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/signin');
  }

};

function insertSessionDB(sessionID, userID) {


  mysqlconnection.pool.query("INSERT INTO Sessions(sessionID, Users_userID) VALUES (?,?)", [sessionID, userID], (error, rows, fields) => {
    if (error) {
      console.log(error);
    }
  });

};


module.exports = {
  validate: validate
};