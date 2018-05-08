
module.exports = function(sequelize, Sequelize) {

	var User = sequelize.define('user', {
		userID: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
		firstName: { type: Sequelize.STRING,notEmpty: true},
		lastName: { type: Sequelize.STRING,notEmpty: true},
		email: { type:Sequelize.STRING, validate: {isEmail:true} },
		password : {type: Sequelize.STRING,allowNull: false }, 
		suiteNumber: { type: Sequelize.STRING,notEmpty: true},
});

	return User;

}