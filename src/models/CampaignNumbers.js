const { DataTypes } = require('sequelize');

const { Sequelize } = require('../lib');

const CampaignNumbers = Sequelize.define('campaign_numbers', {
	number_id: {
		type: DataTypes.UUID,
		allowNull: false,
		primaryKey: true
	},
	campaign_id: {
		type: DataTypes.UUID,
		allowNull: false
	},
	number: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	called: {
		type: DataTypes.BOOLEAN,
		allowNull: false
	}
}, {
	timestamps: false
}, {
	indexes: [
		{
			name: 'campaign_numbers',
			using: 'BTREE',
			unique: true,
			fields: ['number_id', 'campaign_id']
		}
	]
});

module.exports = CampaignNumbers;
