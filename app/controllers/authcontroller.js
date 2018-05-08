var exports = module.exports = {}

exports.signup = (req,res) => {
	res.render('home'); 
}

exports.signin = (req,res) => {
	res.render('home'); 
}

exports.boardpage = (req,res) => {
	res.render('boardpage'); 
}

exports.logout = (req,res) => {
  req.session.destroy((err) => {
  res.redirect('/');
  });

}