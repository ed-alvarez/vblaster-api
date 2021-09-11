const uuid = require('uuid/v4');
const path = require('path');
const fs = require('fs');

const { misc } = require('../../config/main');

const { Logger, Multer } = require('../lib');
const { CampaignAudioFiles } = require('../models');

const createAudioFile = (req, res) => {
	const { campaign_id } = req.params;

	Multer(req, res, err => {
		if (err) {
			Logger('error', err.message);
			return res.status(500).json({
				message: '500: Internal Server Error',
				success: false
			});
		}

		if (path.extname(req.file.path) != '.gsm' && path.extname(req.file.path) != '.wav') {
			fs.unlinkSync(req.file.path);

			return res.status(400).json({
				message: '400 Bad Request - Uploaded file format needs to be GSM or WAV.',
				success: false
			});
		}

		CampaignAudioFiles.findOne({
			where: {
				campaign_id,
				file_name: req.file.originalname.split('.')[0].replace(/\s+/g, '-').toLowerCase()
			}
		}).then(data => {
			if (data) {
				return res.status(409).json({
					message: '409: Conflict - Audio file already exists.',
					success: false
				});
			}

			CampaignAudioFiles.create({
				file_id: uuid(),
				campaign_id,
				file_name: req.file.originalname.split('.')[0].replace(/\s+/g, '-').toLowerCase(),
				file_type: req.file.originalname.split('.')[1]
			}).then(() => {
				res.status(201).json({
					message: `Uploaded audio file ${req.file.originalname}.`,
					success: true
				});
			}).catch(err => {
				Logger('error', err.message);
				res.status(500).json({
					message: '500: Internal Server Error',
					success: false
				});
			});
		});
	});
};

const getCampaignAudioFiles = (req, res) => {
	const { campaign_id } = req.params;

	CampaignAudioFiles.findAll({
		where: {
			campaign_id
		}
	}).then(data => {
		if (data.length == 0) {
			return res.status(200).json({
				message: 'This campaign has no audio files.',
				success: true
			});
		}

		res.status(200).json({
			success: true,
			total: data.length,
			audio_files: data
		});
	}).catch(err => {
		Logger('error', err.message);
		res.status(500).json({
			message: '500: Internal Server Error',
			success: false
		});
	});
};

const deleteAudioFile = (req, res) => {
	const { campaign_id } = req.params;
	const { file_id, file_name, file_type } = req.body;

	if (!file_id || !file_name || !file_type) {
		return res.status(400).json({
			message: '400: Bad Request',
			success: false
		});
	}

	CampaignAudioFiles.destroy({
		where: {
			campaign_id,
			file_id,
			file_name
		}
	}).then(data => {
		if (data == 0) {
			return res.status(404).json({
				message: '404: Not Found',
				success: false
			});
		}

		try {
			fs.unlinkSync(`${misc.audioFilePath}/${campaign_id}_${file_name}.${file_type}`);
		} catch (err) {
			Logger('warn', `Tried to delete audio file for campaign ${campaign_id}, but it wasn't found. (${misc.audioFilePath}/${campaign_id}_${file_name}.${file_type})`);
		}

		res.status(200).json({
			message: 'Deleted file successfully.',
			success: true
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
	createAudioFile,
	getCampaignAudioFiles,
	deleteAudioFile
};
