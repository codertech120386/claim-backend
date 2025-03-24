const express = require('express');
const router = express.Router();

const sessionController = require('./sessionController');

router.post('/start-session', sessionController.startSession);
router.post('/submit-otp', sessionController.submitOTP);

module.exports = router;
