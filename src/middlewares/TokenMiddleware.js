const jwt = require('jsonwebtoken');

const { jwtKey } = require('../../config/main');

const verifyToken = (req, res, next) => {
	let token = req.header('Authorization');

	if (!token || !token.startsWith('Bearer ')) {
		return res.status(400).json({
			message: '400: Bad Request - Token must be a valid Bearer token ' +
				'included in the Authorization header.',
			success: false
		});
	}

	token = token.slice(7, token.length);

	jwt.verify(token, jwtKey, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				message: '401: Unauthorized - Invalid token.',
				success: false
			});
		}

		req.decoded = decoded;
		next();
	});
};

module.exports = {
	verifyToken
};
