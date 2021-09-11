const moment = require('moment');
const uuid = require('uuid/v4');

const { Logger } = require('../lib');
const { Campaigns, CampaignAudioFiles, CampaignNumbers } = require('../models');

const createCampaign = (req, res) => {
	const {
		campaign_name,
		campaign_description,
		trunk,
		ext_or_queue,
		calls_per_minute,
		prefix,
		caller_id,
		status,
		audio_file
	} = req.body;

	if (!campaign_name || !campaign_description || !trunk || !ext_or_queue ||
		!calls_per_minute || !prefix || !caller_id || Boolean(status) || !audio_file) {
		return res.status(400).json({
			message: '400: Bad Request',
			success: false
		});
	}

	Campaigns.findOne({
		where: {
			user_id: req.decoded.user_id,
			campaign_name
		}
	}).then(data => {
		if (data) {
			return res.status(409).json({
				message: '409: Conflict - Campaign already exists.',
				success: false
			});
		}

		Campaigns.create({
			campaign_id: uuid(),
			user_id: req.decoded.user_id,
			campaign_name,
			campaign_description,
			trunk,
			ext_or_queue,
			calls_per_minute,
			prefix,
			caller_id,
			status,
			audio_file,
			created_on: moment().unix()
		}).then(() => {
			res.status(201).json({
				message: `Campaign created successfully`,
				success: true,
				campaign_name,
				campaign_description,
				trunk,
				ext_or_queue,
				calls_per_minute,
				prefix,
				caller_id,
				audio_file,
				status: status
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

const getCampaign = (req, res) => {
	const { campaign_id } = req.params;

	Campaigns.findOne({
		where: {
			user_id: req.decoded.user_id,
			campaign_id
		},
		raw: true
	}).then(async data => {
		if (!data) {
			return res.status(404).json({
				message: '404: Not Found',
				success: false
			});
		}

		const availableAudioFiles = await CampaignAudioFiles.findAll({
			where: {
				campaign_id
			}
		});

		res.status(200).json({
			success: true,
			campaign_id: data.campaign_id,
			campaign_name: data.campaign_name,
			campaign_description: data.campaign_description,
			trunk: data.trunk,
			ext_or_queue: data.ext_or_queue,
			calls_per_minute: data.calls_per_minute,
			prefix: data.prefix,
			caller_id: data.caller_id,
			status: data.status,
			created_on: data.created_on,
			audio_file: data.audio_file,
			available_audio_files: availableAudioFiles
		});
	}).catch(err => {
		Logger('error', err.message);
		res.status(500).json({
			message: '500: Internal Server Error',
			success: false
		});
	});
};

const deleteCampaign = (req, res) => {
	const { campaign_id } = req.params;

	Campaigns.destroy({
		where: {
			campaign_id
		}
	}).then(data => {
		if (data == 0) {
			return res.status(404).json({
				message: '404: Not Found',
				success: false
			});
		}

		CampaignNumbers.destroy({
			where: {
				campaign_id
			}
		}).then(() => {
			res.status(200).json({
				message: 'Deleted campaign successfully.',
				success: true,
				campaign_id
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

const updateCampaign = (req, res) => {
	const {
		campaign_name,
		campaign_description,
		trunk,
		ext_or_queue,
		calls_per_minute,
		prefix,
		caller_id,
		status,
		audio_file
	} = req.body;

	const { campaign_id } = req.params;

	Campaigns.findOne({
		where: {
			campaign_id
		}
	}).then(data => {
		if (!data) {
			return res.status(404).json({
				message: '404: Not Found',
				success: false
			});
		}

		const targetCampaign = data.get({ plain: true });

		const sourceCampaign = {
			campaign_name: campaign_name || data.campaign_name,
			campaign_description: campaign_description || data.campaign_description,
			trunk: trunk || data.trunk,
			ext_or_queue: ext_or_queue || data.ext_or_queue,
			calls_per_minute: calls_per_minute || data.calls_per_minute,
			prefix: prefix || data.prefix,
			caller_id: caller_id || data.caller_id,
			status: status === false ? data.status : status,
			audio_file: audio_file || data.audio_file
		};

		const updatedCampaign = Object.assign(targetCampaign, sourceCampaign);

		Campaigns.update({
			...updatedCampaign
		}, {
			where: {
				campaign_id: targetCampaign.campaign_id,
				user_id: targetCampaign.user_id
			}
		}).then(() => {
			res.status(200).json({
				message: 'Campaign updated successfully.',
				success: true,
				updated_campaign: updatedCampaign
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

const resetCampaign = (req, res) => {
	const { campaign_id } = req.params;

	Campaigns.findOne({
		where: {
			campaign_id
		}
	}).then(data => {
		if (!data) {
			return res.status(404).json({
				message: '404: Not Found',
				success: false
			});
		}

		Campaigns.update({
			status: 1,
		}, {
			where: {
				campaign_id
			}
		}).then(() => {
			CampaignNumbers.update({
				called: 0
			}, {
				where: {
					campaign_id
				}
			}).then(() => {
				res.status(200).json({
					message: `Reinitialized campagin ${campaign_id}.`,
					success: true
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
	});
};

const getUserCampaigns = (req, res) => {
	Campaigns.findAll({
		where: {
			user_id: req.decoded.user_id
		}
	}).then(data => {
		if (data.length == 0) {
			return res.status(200).json({
				message: 'User has no campaigns.'
			});
		}

		const reqCampaigns = data.map(d => ({
			campaign_id: d.campaign_id,
			campaign_name: d.campaign_name,
			campaign_description: d.campaign_description,
			trunk: d.trunk,
			ext_or_queue: d.ext_or_queue,
			calls_per_minute: d.calls_per_minute,
			prefix: d.prefix,
			status: d.status,
			created_on: d.created_on,
			audio_file: d.audio_file
		}));

		res.status(200).json({
			success: true,
			total: reqCampaigns.length,
			campaigns: reqCampaigns
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
	createCampaign,
	getCampaign,
	updateCampaign,
	resetCampaign,
	deleteCampaign,
	getUserCampaigns
};
