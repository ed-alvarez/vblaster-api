const { Logger } = require('../lib');
const { Campaigns, CampaignNumbers } = require('../models');

Campaigns.hasOne(CampaignNumbers, { foreignKey: 'campaign_id' });
CampaignNumbers.belongsTo(Campaigns, { foreignKey: 'campaign_id' });

const verifyCampaign = (req, res, next) => {
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

		next();
	}).catch(err => {
		Logger('error', err.message);
		res.status(500).json({
			message: '500: Internal Server Error',
			success: false
		});
	});
};

module.exports = {
	verifyCampaign
};
