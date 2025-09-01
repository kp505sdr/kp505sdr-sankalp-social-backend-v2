const express = require('express');
const router = express.Router();
const { createProductPage, getAllProductPages, getProductPageById, deleteProductPage, updateProductPageGetdonation } = require('../controllers/productPageController');



router.post("/create-product", createProductPage);
router.get("/get-all-product", getAllProductPages);
router.get("/product/:id", getProductPageById);
router.put("/update-on-donation/:id", updateProductPageGetdonation);
router.delete("/product/:id", deleteProductPage);

module.exports = router;
