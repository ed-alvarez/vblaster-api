const { DataTypes } = require('sequelize');

const { Sequelize } = require('../lib');

const Users = Sequelize.define('users', {
	user_id: {
		type: DataTypes.UUID,
		allowNull: false,
		primaryKey: true
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false
	},
	password: {
		type: DataTypes.STRING.BINARY,
		allowNull: false
	},
	refresh_token: {
		type: DataTypes.TEXT,
		allowNull: false
	}
}, {
	timestamps: false
}, {
	indexes: [
		{
			name: 'users',
			using: 'BTREE',
			unique: true,
			fields: ['user_id', 'username']
		}
	]
});

module.exports = Users;
