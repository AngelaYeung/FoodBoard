var exports = module.exports = {}
var mysqlconnection = require('../public/js/mysqlconnection');

var connection = mysqlconnection.handleDisconnect();

exports.signup = (req, res) => {
  res.render('home');
}

exports.signin = (req, res) => {
  res.render('home');
}

exports.boardpage = (req, res) => {
  res.render('boardpage');
}

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error occured while logging out: ", err);
    }
    connection.query(`DELETE FROM sessions WHERE sessionID = '${req.sessionID}'`, (error, rows, fields) => {
      if (error) {
        console.log("Error occured while trying to delete sessionID from Sessions: ", error);
      } else {
        console.log("Successful deletion of sessionID from Sessions.");
      }
    });
    res.redirect('/');

  });
};
