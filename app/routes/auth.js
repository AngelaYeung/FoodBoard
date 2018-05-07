var authController = require('../controllers/authcontroller.js');

var validate = (app, passport) => {

    app.get('/signup', authController.signup);

    app.get('/signin', authController.signin);

    // Apple the local strategy to the registration route, re-directing to foodboard upon success and homepage if not.
    app.post('/user_registration', passport.authenticate('local-signup', {
        successRedirect: '/dashboard',
        failureFlash: "Registration failed."
    }
    ));
    app.get('/dashboard', isLoggedIn, authController.dashboard);
    app.get('/logout', authController.logout);
    app.post('/user_login', passport.authenticate('local-signin', {
        successRedirect: '/dashboard',
        failureFlash: "Incorrect email or password."
    }
    ));


    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/signin');
    }

};


module.exports = {
    validate
};




