const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validate = require('../middelwares/validate');

router.post('/placeOrder', validate, userController.placeOrder);
router.get('/getOrders', validate, userController.getOrders);
router.get('/getTransactions', validate, userController.getTransactions);
router.get('/userServices', validate, userController.getUserService);
router.post('/requestRefill', validate, userController.requestRefill);
router.post('/requestRefillStatus', validate, userController.requestRefillStatus);
router.post('/getOrderStatus', validate, userController.getOrderStatus);
router.put('/changePassword', validate, userController.changePassword);

module.exports = router;