const uuid = require('uuid/v4');
const { isNumeric } = require('validator');

const { Logger } = require('../lib');
const { Campaigns, CampaignNumbers } = require('../models');

Campaigns.hasOne(CampaignNumbers, { foreignKey: 'campaign_id' });
CampaignNumbers.belongsTo(Campaigns, { foreignKey: 'campaign_id' });

const _handleFileUpload = (req, res) => {
	if (!req.files || !req.files.numbers) {
		return res.status(400).json({
			message: '400: Bad Request - Use only multipart/form-data for file uploads. ' +
				'Otherwise use application/json for JSON bodies.',
			success: false
		});
	}

	req.files.numbers.forEach(file => {
		console.log(file.mimetype);
	});
};

const getCampaignNumbers = (req, res) => {
	const { campaign_id } = req.params;

	Campaigns.findAll({
		where: {
			user_id: req.decoded.user_id,
			campaign_id: campaign_id
		},
		raw: true,
		include: CampaignNumbers
	}).then(data => {
		if (data.length == 0) {
			return res.status(404).json({
				message: '404: Not Found',
				success: false
			});
		}

		const campaignNumbers = data.map(d => ({
			number: d['campaign_number.number'],
			called: d['campaign_number.called']
		})).filter(f => f.number);

		res.status(200).json({
			success: true,
			total: campaignNumbers.length,
			campaign_id,
			campaign_numbers: campaignNumbers
		});
	}).catch(err => {
		Logger('error', err.message);
		res.status(500).json({
			message: '500: Internal Server Error',
			success: false
		});
	});
};

const addCampaignNumbers = (req, res) => {
	const contentType = req.header('Content-Type');

	if (contentType.startsWith('multipart/form-data'))
		return _handleFileUpload(req, res);

	const { number } = req.body;
	const { campaign_id } = req.params;

	if (!number || !isNumeric(number.toString(), {
		no_symbols: true
	})) {
		return res.status(400).json({
			message: '400: Bad Request - Only numbers are allowed, without special symbols (-, #, +).',
			success: false
		});
	}

	CampaignNumbers.findOne({
		where: {
			campaign_id: campaign_id,
			number
		},
		raw: true
	}).then(data => {
		if (data) {
			return res.status(400).json({
				message: '409: Conflict - This number is already registered in this campaign.',
				success: false
			});
		}

		CampaignNumbers.create({
			number_id: uuid(),
			campaign_id: campaign_id,
			number,
			called: false
		}).then(() => {
			res.status(201).json({
				message: `Added number ${number} to campaign.`,
				success: true,
				number
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

const updateCampaignNumber = (req, res) => {
	const { campaign_id, number } = req.params;
	const { updatedNumber } = req.body;

	if (!updatedNumber || !isNumeric(updatedNumber.toString(), {
		no_symbols: true
	})) {
		return res.status(400).json({
			message: '400: Bad Request',
			success: false
		});
	}

	CampaignNumbers.findOne({
		where: {
			campaign_id: campaign_id,
			number
		},
		raw: true
	}).then(async data => {
		if (!data) {
			return res.status(404).json({
				message: '404: Not Found'
			});
		}

		const reqNumber = await CampaignNumbers.findOne({
			where: {
				campaign_id: campaign_id,
				number: updatedNumber
			},
			raw: true
		}).catch(err => {
			Logger('error', err.message);
			res.status(500).json({
				message: '500: Internal Server Error'
			});
		});

		if (reqNumber) {
			return res.status(409).json({
				message: '409: Conflict - This number is already registered in this campaign.'
			});
		}

		CampaignNumbers.update({
			number: updatedNumber
		}, {
			where: {
				campaign_id: campaign_id,
				number
			}
		}).then(() => {
			res.status(200).json({
				message: 'Campaign number updated successfully.',
				success: true,
				old_number: number,
				new_number: updatedNumber
			});
		}).catch(err => {
			Logger('error', err.message);
			res.status(500).json({
				message: '500: Internal Server Error'
			});
		});
	}).catch(err => {
		Logger('error', err.message);
		res.status(500).json({
			message: '500: Internal Server Error'
		});
	});
};

const deleteCampaignNumber = (req, res) => {
	const { campaign_id, number } = req.params;

	CampaignNumbers.destroy({
		where: {
			campaign_id: campaign_id,
			number
		}
	}).then(data => {
		if (data == 0) {
			return res.status(404).json({
				message: '404: Not Found',
				success: false
			});
		}

		res.status(200).json({
			message: 'Deleted Number successfully.',
			success: true,
			number
		});
	}).catch(err => {
		Logger('error', err.message);
		res.status(500).json({
			message: '500: Internal Server Error',
			success: false
		});
	});
};

const updateCampaignNumberStatus = (req, res) => {
	const { campaign_id, number } = req.params;
	const { called } = req.body;

	if (!number || !isNumeric(number.toString(), {
		no_symbols: true
	}) || typeof called !== 'boolean') {
		return res.status(400).json({
			message: '400: Bad Request',
			success: false
		});
	}

	CampaignNumbers.findOne({
		where: {
			campaign_id: campaign_id,
			number
		},
		raw: true
	}).then(data => {
		if (!data) {
			return res.status(404).json({
				message: '404: Not Found',
				success: false
			});
		}

		CampaignNumbers.update({
			called
		}, {
			where: {
				campaign_id: campaign_id,
				number
			}
		}).then(() => {
			res.status(200).json({
				message: 'Campaign number status changed.',
				success: true,
				old_status: data.called,
				new_status: called
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

const getNumber = (req, res) => {
	const { campaign_id, number } = req.params;

	CampaignNumbers.findOne({
		where: {
			campaign_id: campaign_id,
			number
		},
		raw: true
	}).then(data => {
		if (!data) {
			return res.status(404).json({
				message: '404: Not Found',
				success: false
			});
		}

		res.status(200).json({
			success: true,
			number: data.number,
			called: data.called
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
	getCampaignNumbers,
	addCampaignNumbers,
	updateCampaignNumber,
	deleteCampaignNumber,
	updateCampaignNumberStatus,
	getNumber
};
