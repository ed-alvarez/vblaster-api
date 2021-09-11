const Sequelize = require('sequelize');

const { mysql } = require('../../config/main');

const Logger = require('./Logger');

const { host, username, password, database } = mysql;

if (!host || !username || !password || !database)
	throw new Error('Missing mysql configuration. Check your main.json file or refer to docs.');

const client = new Sequelize(database, username, password, {
	host,
	dialect: 'mysql',
	logging: process.env.NODE_ENV == 'dev' ? console.log : false
});

client.authenticate()
	.then(() => Logger('success', 'Connection to DB established successfully.'))
	.catch(err => Logger('error', `Failed to connect to DB. ${err.message}`));

module.exports = client;
