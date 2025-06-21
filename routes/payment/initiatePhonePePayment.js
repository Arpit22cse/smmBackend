const express = require('express');
const User = require('../../models/User');
require('dotenv').config();

const router = express.Router();

const MERCHANT_ID = process.env.MERCHANT_ID;
const SALT_KEY = process.env.SALT_KEY;
const SALT_INDEX = '1';
const CALLBACK_URL = process.env.CALLBACK_URL;

router.post('/', async(req, res) => {
    // You can access request body via req.body if needed
      const { userId, amount } = req.body;
      console.log(req.body);

  // const user = await User.findOne({userId});
  // if (!user) return res.status(404).json({ message: 'User not found' });

  const transactionId = `TXN_${Date.now()}`;
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: transactionId,
    merchantUserId: userId,
    amount: amount * 100,
    redirectUrl: CALLBACK_URL,
    redirectMode: 'POST',
    callbackUrl: CALLBACK_URL,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const stringToHash = payloadBase64 + '/pg/v1/pay' + SALT_KEY;
  const checksum = crypto.createHash('sha256').update(stringToHash).digest('hex') + '###' + SALT_INDEX;

  try {
    const response = await axios.post(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
      { request: payloadBase64 },
      { headers: { 'Content-Type': 'application/json', 'X-VERIFY': checksum, accept: 'application/json' } }
    );

    const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
    res.json({ paymentUrl: redirectUrl, transactionId });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
});

module.exports = router;