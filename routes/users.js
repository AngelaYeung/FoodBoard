var express = require('express');
var router = express.Router();

// Register path
router.get('/register', (req, res) => {
  res.render('register');
});

// Login path
router.get('/login', (req, res) => {
  res.render('login');
});

// Register user
router.post('/register', (req, res) => {
  let firstName = req.body.register_first_name;
  let lastName = req.body.register_last_name;
  let email = req.body.register_email;
  let pwd = req.body.register_pwd;
  let pwd2 = req.body.register_pwd_confirm;
  let suiteNumber = req.body.register_suite_number;

  console.log(firstName);

});
modules.exports = router;
