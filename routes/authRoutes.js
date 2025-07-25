const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middelwares/validate')

router.post('/login', authController.login);
router.get('/me', validate, authController.getMe);

module.exports = router;