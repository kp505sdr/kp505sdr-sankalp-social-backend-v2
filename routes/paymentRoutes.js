const express = require('express');
const { createOrder, verifyPayment, certiFicate, sendCertificate, send80gCertificate, getAll80Gcertificate } = require('../controllers/paymentController');
const router = express.Router();



router.post('/create-order',createOrder);
router.post('/verify-payment',verifyPayment);
router.get("/certificate/:razorpay_payment_id", certiFicate);
router.get("/send-certificate/:razorpay_payment_id", sendCertificate);
router.post("/send-certificate80", send80gCertificate);
router.get("/get-all-certificate80", getAll80Gcertificate);














module.exports = router;
