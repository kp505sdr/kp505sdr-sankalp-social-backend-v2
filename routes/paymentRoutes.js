const express = require('express');
const { createOrder, verifyPayment, certiFicate } = require('../controllers/paymentController');
const router = express.Router();



router.post('/create-order',createOrder);
router.post('/verify-payment',verifyPayment);
router.get("/certificate/:razorpay_payment_id", certiFicate);











module.exports = router;
