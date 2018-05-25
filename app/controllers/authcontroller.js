var exports = module.exports = {}
var mysqlconnection = require('../public/js/mysqlconnection');

exports.signup = (req, res) => {
  res.render('home');
}

exports.signin = (req, res) => {
  res.render('home');
}

exports.boardpage = (req, res) => {
  res.render('boardpage');
}

exports.myposts = (req, res) => {
  res.render('myposts');
}

exports.myclaims = (req, res) => {
  res.render('myclaims');
}

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error occured while logging out: ", err);
    }


    mysqlconnection.pool.query(`DELETE FROM Sessions WHERE sessionID = '${req.sessionID}'`, (error, rows, fields) => {
      if (error) {
        console.log("Error occured while trying to delete sessionID from Sessions: ", error);
      } else {
        console.log("Successful deletion of sessionID from Sessions.");
      }

    });


    res.redirect('/');

  });
};