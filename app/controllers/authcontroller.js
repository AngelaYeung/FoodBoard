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

exports.account = (req, res) => {
  var query = `SELECT * FROM Sessions WHERE sessionID = '${req.sessionID}' LIMIT 1`;
  mysqlconnection.pool.query(query, (error, rows, fields) => {
    if (error) {
      console.log(new Date(Date.now()), "Error selecting userID from accounts:", error);
    } else {
      if (rows.length) {
        console.log("THIS IS THE COMPLETE SESION RETURNED:", rows);
        var userID = rows[0].Users_userID;
        console.log("USERID FOR MYACCOUNT:", userID);
        //Query for user info for current user
        var userInfo = "SELECT * FROM users WHERE userID = ?";
        mysqlconnection.pool.query(userInfo, [userID], (error, result, field) => {
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
};

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