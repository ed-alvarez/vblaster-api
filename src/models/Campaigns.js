const { DataTypes } = require('sequelize');

const { Sequelize } = require('../lib');

const Campaigns = Sequelize.define('campaigns', {
	campaign_id: {
		type: DataTypes.UUID,
		allowNull: false,
		primaryKey: true
	},
	user_id: {
		type: DataTypes.UUID,
		allowNull: false
	},
	campaign_name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	campaign_description: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	trunk: {
		type: DataTypes.STRING,
		allowNull: false
	},
	ext_or_queue: {
		type: DataTypes.STRING,
		allowNull: false
	},
	calls_per_minute: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	prefix: {
		type: DataTypes.STRING,
		allowNull: false
	},
	caller_id: {
		type: DataTypes.STRING,
		allowNull: false
	},
	status: {
		type: DataTypes.TINYINT,
		allowNull: false
	},
	created_on: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	audio_file: {
		type: DataTypes.STRING,
		allowNull: false
	}
}, {
	timestamps: false
}, {
	indexes: [
		{
			name: 'campaigns',
			using: 'BTREE',
			unique: true,
			fields: ['campaign_id', 'user_id']
		}
	]
});

module.exports = Campaigns;
