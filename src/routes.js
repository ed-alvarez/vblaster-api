const { Router } = require('express');

const {
	Campaign,
	CampaignAudioFiles,
	CampaignNumbers,
	Users
} = require('./controllers');

const { CampaignMiddleware, TokenMiddleware } = require('./middlewares');

const router = Router();

router.post('/users/auth', Users.auth);
router.post('/users/create', Users.create);
router.post('/users/token', Users.refreshToken);

router.use(TokenMiddleware.verifyToken);

router.get('/users/@me', Users.me);

router.get('/campaigns', Campaign.getUserCampaigns);
router.post('/campaigns', Campaign.createCampaign);
router.get('/campaigns/:campaign_id', Campaign.getCampaign);

router.put('/campaigns/:campaign_id',
	CampaignMiddleware.verifyCampaign,
	Campaign.updateCampaign);

router.patch('/campaigns/:campaign_id/reset',
	CampaignMiddleware.verifyCampaign,
	Campaign.resetCampaign);

router.delete('/campaigns/:campaign_id',
	CampaignMiddleware.verifyCampaign,
	Campaign.deleteCampaign);

router.get('/campaigns/:campaign_id/audio-files',
	CampaignMiddleware.verifyCampaign,
	CampaignAudioFiles.getCampaignAudioFiles);

router.post('/campaigns/:campaign_id/audio-files',
	CampaignMiddleware.verifyCampaign,
	CampaignAudioFiles.createAudioFile);

router.delete('/campaigns/:campaign_id/audio-files',
	CampaignMiddleware.verifyCampaign,
	CampaignAudioFiles.deleteAudioFile);

router.get('/campaigns/:campaign_id/numbers',
	CampaignMiddleware.verifyCampaign,
	CampaignNumbers.getCampaignNumbers);

router.post('/campaigns/:campaign_id/numbers',
	CampaignMiddleware.verifyCampaign,
	CampaignNumbers.addCampaignNumbers);

router.get('/campaigns/:campaign_id/numbers/:number',
	CampaignMiddleware.verifyCampaign,
	CampaignNumbers.getNumber);

router.put('/campaigns/:campaign_id/numbers/:number',
	CampaignMiddleware.verifyCampaign,
	CampaignNumbers.updateCampaignNumber);

router.put('/campaigns/:campaign_id/numbers/:number/status',
	CampaignMiddleware.verifyCampaign,
	CampaignNumbers.updateCampaignNumberStatus);

router.delete('/campaigns/:campaign_id/numbers/:number',
	CampaignMiddleware.verifyCampaign,
	CampaignNumbers.deleteCampaignNumber);

router.use((req, res) => {
	res.status(404).json({
		message: '404: Not Found'
	});
});

module.exports = router;
