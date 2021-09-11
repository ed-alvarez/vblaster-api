const multer = require('multer');

const { misc } = require('../../config/main');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, misc.audioFilePath);
	},
	filename: (req, file, cb) => {
		cb(null, `${req.params.campaign_id}_${file.originalname}`);
	}
});

const upload = multer({ storage }).single('file');

module.exports = upload;
