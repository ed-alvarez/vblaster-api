const { DataTypes } = require('sequelize');

const { Sequelize } = require('../lib');

const CampaignAudioFiles = Sequelize.define('campaign_audio_files', {
	file_id: {
		type: DataTypes.UUID,
		allowNull: false,
		primaryKey: true
	},
	campaign_id: {
		type: DataTypes.UUID,
		allowNull: false
	},
	file_name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	file_type: {
		type: DataTypes.STRING,
		allowNull: false
	}
}, {
	timestamps: false
}, {
	indexes: [
		{
			name: 'campaign_audio_files',
			using: 'BTREE',
			unique: true,
			fields: ['file_id', 'campaign_id']
		}
	]
});

module.exports = CampaignAudioFiles;
