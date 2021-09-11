const uuid = require('uuid/v4');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isAlphanumeric, isAscii } = require('validator');

const { jwtKey, jwtRefreshKey } = require('../../config/main');
const { Logger } = require('../lib');
const { Users } = require('../models');

const _generateTokens = id => {
	const token = jwt.sign({ user_id: id }, jwtKey, { expiresIn: '1d' });
	const refreshToken = jwt.sign({ user_id: id }, jwtRefreshKey, { expiresIn: '2d' });

	return Users.update(
		{
			refresh_token: refreshToken
		},
		{
			where: {
				user_id: id
			}
		}
	).then(() => ({
		token,
		refreshToken
	}));
};

const auth = (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({
			message: '400: Bad Request',
			success: false
		});
	}

	Users.findOne({
		where: {
			username
		},
		raw: true
	}).then(async data => {
		if (!data) {
			return res.status(401).json({
				message: '401: Unauthorized',
				success: false
			});
		}

		const passwordMatch = await bcrypt.compare(password, data.password.toString());

		if (!passwordMatch) {
			return res.status(401).json({
				message: '401: Unauthorized',
				success: false
			});
		}

		_generateTokens(data.user_id).then(({ token, refreshToken }) => {
			res.status(200).json({
				message: `Welcome ${data.username}.`,
				success: true,
				user_id: data.user_id,
				username: data.username,
				token,
				refreshToken
			});
		}).catch(err => {
			Logger('error', err.message);
			res.status(500).json({
				message: '500: Internal Server Error',
				success: false
			});
		});
	}).catch(err => {
		Logger('error', err.message);
		res.status(500).json({
			message: '500: Internal Server Error',
			success: false
		});
	});
};

const create = (req, res) => {
	const { username, password } = req.body;
	const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

	if (!username || !password) {
		return res.status(400).json({
			message: '400: Bad Request',
			success: false
		});
	}

	Users.findOne({
		where: {
			username
		},
		raw: true
	}).then(async data => {
		if (data) {
			return res.status(409).json({
				message: '409: Conflict - User already exists.',
				success: false
			});
		}

		if (!pwdRegex.test(password) || !isAscii(username)) {
			return res.status(400).json({
				message: '400: Bad Request - Password must contain at least 1 lower case character, ' +
					'1 uppercase character, 1 number, at least one special character, and ' +
					'it must be 8 characters or longer.',
				success: false
			});
		}

		if (!isAlphanumeric(username)) {
			return res.status(400).json({
				message: '400: Bad Request - Username can only contain alphanumeric characters.',
				success: false
			});
		}

		Users.create({
			user_id: uuid(),
			username,
			password: await bcrypt.hash(password, 8),
			refresh_token: false
		}).then(user => {
			const { user_id, username } = user.get({ plain: true });

			res.status(201).json({
				message: `Welcome to the realm, ${username}.`,
				success: true,
				user_id,
				username
			});
		}).catch(err => {
			Logger('error', err.message);
			res.status(500).json({
				message: '500: Internal Server Error',
				success: false
			});
		});
	}).catch(err => {
		Logger('error', err.message);
		res.status(500).json({
			message: '500: Internal Server Error',
			success: false
		});
	});
};

const refreshToken = (req, res) => {
	const { username, refreshToken } = req.body;

	if (!username || !refreshToken) {
		return res.status(400).json({
			message: '400: Bad Request',
			success: false
		});
	}

	Users.findOne({
		where: {
			username,
			refresh_token: refreshToken
		},
		raw: true
	}).then(data => {
		if (!data) {
			return res.status(401).json({
				message: '401: Unauthorized',
				success: false
			});
		}

		_generateTokens(data.user_id).then(({ token, refreshToken }) => {
			res.status(200).json({
				message: `Welcome back, ${data.username}.`,
				success: true,
				username: data.username,
				token,
				refreshToken
			});
		}).catch(err => {
			Logger('error', err.message);
			res.status(500).json({
				message: '500: Internal Server Error',
				success: false
			});
		});
	}).catch(err => {
		Logger('error', err.message);
		res.status(500).json({
			message: '500: Internal Server Error',
			success: false
		});
	});
};

const me = (req, res) => {
	Users.findOne({
		where: {
			user_id: req.decoded.user_id
		},
		raw: true
	}).then(data => {
		if (!data) {
			if (req.decoded.user_id) delete req.decoded.user_id;

			return res.status(404).json({
				message: '404: Not Found',
				success: false
			});
		}

		res.status(200).json({
			success: true,
			user_id: data.user_id,
			username: data.username
		});
	}).catch(err => {
		Logger('error', err.message);
		res.status(500).json({
			message: '500: Internal Server Error',
			success: false
		});
	});
};

module.exports = {
	auth,
	create,
	refreshToken,
	me
};
