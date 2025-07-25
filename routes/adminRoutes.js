const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const validate = require('../middelwares/validate');

router.post('/createUser', validate, adminController.createUser);
router.post('/getUser', validate, adminController.getUser);
router.put('/addBalance', validate, adminController.addBalance);
router.post('/changeUserPassword', validate, adminController.changeUserPassword);

// Services by admin
router.post('/createService', validate, adminController.createService);
router.put('/updateService', validate, adminController.updateService);
router.post('/addService', validate, adminController.addService);
router.post('/deleteService', validate, adminController.removeService);
router.get('/getCustomServices', validate, adminController.getCustomServices);
router.post('/deleteCustomServices', validate, adminController.deleteService);
router.get('/getServices', validate, adminController.getServices);

module.exports = router;