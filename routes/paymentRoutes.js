const express = require('express');
const { createOrder, verifyPayment, certiFicate, sendCertificate } = require('../controllers/paymentController');
const router = express.Router();



router.post('/create-order',createOrder);
router.post('/verify-payment',verifyPayment);
router.get("/certificate/:razorpay_payment_id", certiFicate);
router.get("/send-certificate/:razorpay_payment_id", sendCertificate);












module.exports = router;
