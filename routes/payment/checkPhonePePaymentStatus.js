const express = require('express');
require('dotenv').config();
const axios = require('axios');
const router = express.Router();

const MERCHANT_ID = process.env.MERCHANT_ID;
const SALT_KEY = process.env.SALT_KEY;
const SALT_INDEX = '1';
const CALLBACK_URL = process.env.CALLBACK_URL;

// Example route: GET /check-status/:id
router.post('/', async(req, res) => {
    const { transactionId } = req.body;
    console.log(req.body);

  const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${transactionId}` + SALT_KEY;
  const checksum = crypto.createHash('sha256').update(stringToHash).digest('hex') + '###' + SALT_INDEX;

  try {
    const response = await axios.get(
      `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${MERCHANT_ID}/${transactionId}`,
      { headers: { 'Content-Type': 'application/json', 'X-VERIFY': checksum } }
    );

    const status = response.data.data.transactionStatus;
    res.status(200).json({ status });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to check transaction status' });
  }
});

module.exports = router;