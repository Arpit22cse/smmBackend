const express = require('express');
const User = require('../../models/User')
const router = express.Router();

// POST /payment/phonePeCallback
router.post('/', async(req, res) => {
    // Access request body
  const { transactionId } = req.body;
  const status = req.body.transactionStatus;
  console.log(req.body);

  if (status !== 'SUCCESS') {
    return res.status(400).send('Payment Failed');
  }

  // Dummy example: Extract amount from DB or store elsewhere per txn
  const userId = req.body.merchantUserId;
  const amount = req.body.amount / 100;

  const user = await User.findOne({userId});
  if (!user) return res.status(404).send('User not found');

  user.money += amount;
  await user.save();

  res.status(200).send('Payment successful and balance updated');
});

module.exports = router;