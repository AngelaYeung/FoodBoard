var exports = module.exports = {}
var mysql = require('mysql');
var dbconfig = require('../public/js/dbconfig.js');
var connection = mysql.createConnection(dbconfig);

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
    connection.query(`DELETE FROM sessions WHERE sessionID = '${req.sessionID}'`, (error, rows, fields) => {
      if (error) {
        console.log(error);
      }
    });
    res.redirect('/');
  });
};