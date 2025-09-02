const express = require('express');
const router = express.Router();
const { createProductPage, getAllProductPages, getProductPageById, deleteProductPage, updateProductPageGetDonation } = require('../controllers/productPageController');



router.post("/create-product", createProductPage);
router.get("/get-all-product", getAllProductPages);
router.get("/product/:id", getProductPageById);
router.patch("/update-on-donation/:campaignId", updateProductPageGetDonation);
router.delete("/product/:id", deleteProductPage);

module.exports = router;
