const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { http } = require('../config/main');
const { Logger } = require('./lib');

const app = express();

app.use(cors({
	origin: http.allowedOrigins,
	credentials: true,
	optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(morgan('common'));

app.disable('x-powered-by');

app.use((err, req, res, next) => {
	if (err)
		return res.status(400).json({
			message: '400: Bad Request'
		});

	return next();
});

app.get('/', (req, res) => res.json({
	msg: `Greetings line ${Math.floor(Math.random() * 10) + 1}. What is your name traveler?`
}));

app.use('/api', require('./routes'));

app.listen(http.port, () => Logger('info',
	`Express server listening on port ${http.port}`));
